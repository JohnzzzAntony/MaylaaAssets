import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const dataDir = path.join(process.cwd(), 'asset-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbDir = path.join(dataDir, 'database.sqlite');
let db;

// Initialize SQLite database
const initDb = async () => {
    try {
        db = await open({
          filename: dbDir,
          driver: sqlite3.Database
        });
        
        await db.exec(`
          CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            entity TEXT,
            is_deleted INTEGER DEFAULT 0,
            data_json TEXT
          )
        `);
        
        console.log('SQL Database (SQLite) initialized successfully at', dbDir);
    } catch (err) {
        console.error('Failed to initialize local SQL database:', err);
    }
};

initDb();

// GET all assets across all categories
app.get('/api/assets/all', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM assets WHERE is_deleted = 0');
        const data = rows.map(row => ({
            ...JSON.parse(row.data_json),
            category: row.category // Include category for global analytics
        }));
        res.json(data);
    } catch (error) {
        console.error("Error reading all assets:", error);
        res.status(500).json({ error: 'Failed to read all assets' });
    }
});

// GET all assets for a category
app.get('/api/assets/:category', async (req, res) => {
    const category = req.params.category;
    try {
        const rows = await db.all('SELECT * FROM assets WHERE category = ? AND is_deleted = 0', category);
        const data = rows.map(row => JSON.parse(row.data_json));
        res.json(data);
    } catch (error) {
        console.error("Error reading database:", error);
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// POST (bulk overwrite) assets for a category
app.post('/api/assets/:category', async (req, res) => {
    const category = req.params.category;
    const dataArray = req.body;
    
    if (!Array.isArray(dataArray)) {
        return res.status(400).json({ error: 'Body must be an array of asset objects' });
    }

    try {
        await db.run('BEGIN TRANSACTION');
        
        // Delete existing category data to overwrite
        await db.run('DELETE FROM assets WHERE category = ?', category);
        
        // Insert new data
        const stmt = await db.prepare('INSERT INTO assets (category, entity, is_deleted, data_json) VALUES (?, ?, ?, ?)');
        for (const item of dataArray) {
            const entity = item.Entity || 'Unknown';
            const isDeleted = item.isDeleted ? 1 : 0;
            await stmt.run(category, entity, isDeleted, JSON.stringify(item));
        }
        await stmt.finalize();
        
        await db.run('COMMIT');
        res.json({ message: 'Saved successfully to local SQL database' });
    } catch (error) {
        if (db) await db.run('ROLLBACK');
        console.error("Error writing to database:", error);
        res.status(500).json({ error: 'Failed to write to database' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Node Server running on port ${PORT}`);
});
