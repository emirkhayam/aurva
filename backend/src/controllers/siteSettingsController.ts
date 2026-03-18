import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { SiteSetting } from '../types/database.types';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
      return;
    }

    // Convert to key-value object for easier frontend use
    const settingsObject = (settings || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ settings: settingsObject });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settingsData = req.body;
    const supabase = getSupabaseClient();

    // Update each setting
    for (const [key, value] of Object.entries(settingsData)) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key, value: value as string },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`Update setting error for key ${key}:`, error);
        res.status(500).json({ error: `Failed to update setting: ${key}` });
        return;
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const initializeDefaultSettings = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const defaults: Array<Partial<SiteSetting>> = [
      { key: 'contact_address', value: 'Кыргызская Республика, г. Бишкек', description: 'Адрес офиса' },
      { key: 'contact_phone', value: '+996 550 99 90 10', description: 'Телефон' },
      { key: 'contact_email', value: 'aurva.kg@gmail.com', description: 'Email' }
    ];

    for (const setting of defaults) {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', setting.key)
        .single();

      if (!existing) {
        await supabase
          .from('site_settings')
          .insert(setting);
      }
    }
  } catch (error) {
    console.error('Initialize settings error:', error);
  }
};
