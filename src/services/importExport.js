import db from './database.js';

class ImportExport {
    async exportToJSON() {
        try {
            const links = db.all('SELECT * FROM links');
            const tags = db.all('SELECT * FROM tags');
            const linkTags = db.all('SELECT * FROM link_tags');
            const settings = db.all('SELECT * FROM settings');

            const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                appName: 'Credlyst',
                data: {
                    links,
                    tags,
                    linkTags,
                    settings
                },
                stats: {
                    totalLinks: links.length,
                    totalTags: tags.length
                }
            };

            console.log('✅ Data exported to JSON');
            return exportData;
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            throw error;
        }
    }

    async importFromJSON(jsonData) {
        try {
            const { data } = jsonData;
            const { links, tags, linkTags, settings } = data;

            // Start transaction
            db.exec('BEGIN TRANSACTION');

            try {
                // Import tags first
                if (tags && tags.length > 0) {
                    for (const tag of tags) {
                        db.run(`
                            INSERT OR IGNORE INTO tags (id, name, color, created_at)
                            VALUES (?, ?, ?, ?)
                        `, [tag.id, tag.name, tag.color, tag.created_at]);
                    }
                }

                // Import links
                if (links && links.length > 0) {
                    for (const link of links) {
                        db.run(`
                            INSERT OR IGNORE INTO links 
                            (id, title, url, description, keywords, category, favorite, created_at, updated_at, last_accessed, access_count)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            link.id, link.title, link.url, link.description, 
                            link.keywords, link.category, link.favorite,
                            link.created_at, link.updated_at, link.last_accessed, link.access_count
                        ]);
                    }
                }

                // Import link-tag relationships
                if (linkTags && linkTags.length > 0) {
                    for (const lt of linkTags) {
                        db.run(`
                            INSERT OR IGNORE INTO link_tags (link_id, tag_id)
                            VALUES (?, ?)
                        `, [lt.link_id, lt.tag_id]);
                    }
                }

                // Import settings
                if (settings && settings.length > 0) {
                    for (const setting of settings) {
                        db.run(`
                            INSERT OR REPLACE INTO settings (key, value, updated_at)
                            VALUES (?, ?, ?)
                        `, [setting.key, setting.value, setting.updated_at]);
                    }
                }

                // Commit transaction
                db.exec('COMMIT');
                console.log('✅ Data imported successfully');
                return true;
            } catch (error) {
                // Rollback on error
                db.exec('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            throw error;
        }
    }

    downloadJSON(data, filename = 'credlyst-backup.json') {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ JSON file downloaded:', filename);
    }

    async exportToSQL() {
        try {
            // Get the raw SQL export
            const sqlExport = db.db.export();
            const blob = new Blob([sqlExport], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `credlyst-backup-${Date.now()}.db`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('✅ SQL database exported');
            return true;
        } catch (error) {
            console.error('❌ Failed to export SQL:', error);
            throw error;
        }
    }

    async importBookmarksHTML(htmlContent) {
        try {
            // Parse HTML bookmarks (Netscape Bookmark format)
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const bookmarks = doc.querySelectorAll('a');
            
            const imported = [];
            
            for (const bookmark of bookmarks) {
                const title = bookmark.textContent;
                const url = bookmark.href;
                const addDate = bookmark.getAttribute('add_date');
                
                if (title && url) {
                    try {
                        db.run(`
                            INSERT INTO links (title, url, category, created_at)
                            VALUES (?, ?, ?, ?)
                        `, [
                            title, 
                            url, 
                            'Imported',
                            addDate ? new Date(parseInt(addDate) * 1000).toISOString() : new Date().toISOString()
                        ]);
                        imported.push({ title, url });
                    } catch (error) {
                        console.warn('⚠️ Skipped duplicate:', url);
                    }
                }
            }
            
            console.log(`✅ Imported ${imported.length} bookmarks`);
            return imported;
        } catch (error) {
            console.error('❌ Failed to import bookmarks:', error);
            throw error;
        }
    }
}

export default new ImportExport();
