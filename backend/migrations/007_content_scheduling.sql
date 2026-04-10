-- Add scheduled publishing to news
ALTER TABLE news ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Index for efficient scheduled content queries
CREATE INDEX IF NOT EXISTS idx_news_scheduled ON news(scheduled_at) WHERE scheduled_at IS NOT NULL AND published = false;
