CREATE TABLE IF NOT EXISTS blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  title_sw        TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT NOT NULL,
  excerpt         TEXT,
  featured_image  TEXT,
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
