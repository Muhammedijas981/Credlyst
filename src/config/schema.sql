-- Credlyst Database Schema
-- SQLite database for local link management

-- Links Table
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    keywords TEXT,
    category TEXT DEFAULT 'General',
    favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME,
    access_count INTEGER DEFAULT 0
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Link-Tags Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS link_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(link_id, tag_id)
);

-- Link History Table (Track usage)
CREATE TABLE IF NOT EXISTS link_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_links_title ON links(title);
CREATE INDEX IF NOT EXISTS idx_links_keywords ON links(keywords);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_favorite ON links(favorite);
CREATE INDEX IF NOT EXISTS idx_link_tags_link_id ON link_tags(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_link_history_link_id ON link_history(link_id);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'light');
INSERT OR IGNORE INTO settings (key, value) VALUES ('view_mode', 'grid');
INSERT OR IGNORE INTO settings (key, value) VALUES ('onboarding_completed', 'false');

-- Insert sample categories
INSERT OR IGNORE INTO tags (name, color) VALUES ('Work', '#3B82F6');
INSERT OR IGNORE INTO tags (name, color) VALUES ('Personal', '#8B5CF6');
INSERT OR IGNORE INTO tags (name, color) VALUES ('Learning', '#10B981');
INSERT OR IGNORE INTO tags (name, color) VALUES ('Important', '#EF4444');
