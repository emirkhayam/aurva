import { Request, Response } from 'express';
import { SiteSettings } from '../models';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SiteSettings.findAll();

    // Convert to key-value object for easier frontend use
    const settingsObject = settings.reduce((acc, setting) => {
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

    // Update each setting
    for (const [key, value] of Object.entries(settingsData)) {
      await SiteSettings.upsert({
        key,
        value: value as string
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const initializeDefaultSettings = async (): Promise<void> => {
  try {
    const defaults = [
      { key: 'contact_address', value: 'Кыргызская Республика, г. Бишкек', description: 'Адрес офиса' },
      { key: 'contact_phone', value: '+996 550 99 90 10', description: 'Телефон' },
      { key: 'contact_email', value: 'aurva.kg@gmail.com', description: 'Email' }
    ];

    for (const setting of defaults) {
      const existing = await SiteSettings.findOne({ where: { key: setting.key } });
      if (!existing) {
        await SiteSettings.create(setting);
      }
    }
  } catch (error) {
    console.error('Initialize settings error:', error);
  }
};
