import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = sqlite3.verbose();

// Ensure db directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'credlyst.db');
const db = new sql.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    const serialize = db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Links Table
        db.run(`CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            keywords TEXT,
            category TEXT DEFAULT 'General',
            favorite BOOLEAN DEFAULT 0,
            access_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_accessed DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Link History
        db.run(`CREATE TABLE IF NOT EXISTS link_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            link_id INTEGER,
            user_id INTEGER,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(link_id) REFERENCES links(id)
        )`);

        // Create default test user if not exists (password: password123)
        const hashedPassword = bcrypt.hashSync('password123', 10);
        db.run(`INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`,
            ['Demo User', 'demo@credlyst.com', hashedPassword]
        );
    });
}

export default db;
