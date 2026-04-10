import { getSupabaseClient } from '../config/supabase';

// Check and publish scheduled news every minute
export function startScheduler() {
  setInterval(async () => {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('news')
        .update({ published: true })
        .lte('scheduled_at', now)
        .eq('published', false)
        .not('scheduled_at', 'is', null)
        .select('id, title');

      if (data && data.length > 0) {
        console.log(`Published ${data.length} scheduled news articles:`, data.map(n => n.title));
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, 60000); // Every minute
}
