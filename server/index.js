import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_credlyst_key'; // In prod, use .env

app.use(cors());
app.use(bodyParser.json());

// --- Authentication Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API Routes ---

// AUTH: Register
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, 
        [name, email, hashedPassword], 
        function(err) {
            if (err) {
                if(err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
                return res.status(500).json({ error: err.message });
            }
            const token = jwt.sign({ id: this.lastID, email, name }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ token, user: { id: this.lastID, email, name } });
        }
    );
});

// AUTH: Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
});

// LINKS: Get All
app.get('/api/links', authenticate, (req, res) => {
    const userId = req.user.id;
    const { search, category, favorite } = req.query;

    let query = `SELECT * FROM links WHERE user_id = ?`;
    let params = [userId];

    if (search) {
        query += ` AND (title LIKE ? OR url LIKE ? OR keywords LIKE ? OR category LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category && category !== 'all') {
        query += ` AND category = ?`;
        params.push(category);
    }
    if (favorite === 'true') {
        query += ` AND favorite = 1`;
    }

    query += ` ORDER BY created_at DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// LINKS: Create
app.post('/api/links', authenticate, (req, res) => {
    const { title, url, description, keywords, category } = req.body;
    const userId = req.user.id;

    db.run(`INSERT INTO links (user_id, title, url, description, keywords, category) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, url, description, keywords, category || 'General'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, ...req.body });
        }
    );
});

// LINKS: Update
app.put('/api/links/:id', authenticate, (req, res) => {
    const { title, url, description, keywords, category, favorite } = req.body;
    const linkId = req.params.id;
    const userId = req.user.id;

    db.run(`UPDATE links SET title=?, url=?, description=?, keywords=?, category=?, favorite=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`,
        [title, url, description, keywords, category, favorite, linkId, userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// LINKS: Delete
app.delete('/api/links/:id', authenticate, (req, res) => {
    const linkId = req.params.id;
    const userId = req.user.id;

    db.run(`DELETE FROM links WHERE id=? AND user_id=?`, [linkId, userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// STATS: Get Stats (Dashboard)
app.get('/api/stats', authenticate, (req, res) => {
    const userId = req.user.id;
    
    db.serialize(() => {
        db.get(`SELECT COUNT(*) as total FROM links WHERE user_id = ?`, [userId], (err, row1) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get(`SELECT COUNT(*) as favorites FROM links WHERE user_id = ? AND favorite = 1`, [userId], (err, row2) => {
                db.get(`SELECT COUNT(DISTINCT category) as categories FROM links WHERE user_id = ?`, [userId], (err, row3) => {
                    res.json({
                        total: row1.total,
                        favorites: row2.favorites,
                        categories: row3.categories
                    });
                });
            });
        });
    });
});

// CATEGORIES: Get all unique categories
app.get('/api/categories', authenticate, (req, res) => {
    const userId = req.user.id;
    
    db.all(`SELECT DISTINCT category, COUNT(*) as count FROM links WHERE user_id = ? GROUP BY category ORDER BY category`, 
        [userId], 
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
