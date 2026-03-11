import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Set up PostgreSQL connection pool
// For local development, it can use a local postgres string.
// For production, it takes the DATABASE_URL from Render/Supabase.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/maylaa',
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false // use SSL only in production (if DATABASE_URL is set)
});

// Initialize database table
const initDb = async () => {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS assets (
            id SERIAL PRIMARY KEY,
            category TEXT,
            entity TEXT,
            is_deleted INTEGER DEFAULT 0,
            data_json TEXT
          )
        `);
        console.log('PostgreSQL database initialized successfully');
    } catch (err) {
        console.error('Failed to initialize PostgreSQL database:', err);
    }
};

initDb();

// Enhanced health-check route to diagnose database connection issues
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 as test');
        res.json({
            status: 'Running beautifully! 🚀',
            database_connection: 'SUCCESS - Connected to cloud database',
            db_test_result: result.rows[0].test
        });
    } catch (err) {
        res.status(500).json({
            status: 'Running, but database connection FAILED ❌',
            error_message: err.message,
            error_code: err.code,
            hint: 'Check if your DATABASE_URL is set correctly in Render and if the password is correct.'
        });
    }
});


// GET all assets across all categories
app.get('/api/assets/all', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM assets WHERE is_deleted = 0');
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
        const { rows } = await pool.query('SELECT * FROM assets WHERE category = $1 AND is_deleted = 0', [category]);
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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        // Delete existing category data to overwrite
        await client.query('DELETE FROM assets WHERE category = $1', [category]);
        
        // Insert new data
        const insertQuery = 'INSERT INTO assets (category, entity, is_deleted, data_json) VALUES ($1, $2, $3, $4)';
        for (const item of dataArray) {
            const entity = item.Entity || 'Unknown';
            const isDeleted = item.isDeleted ? 1 : 0;
            await client.query(insertQuery, [category, entity, isDeleted, JSON.stringify(item)]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Saved successfully to cloud database' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error writing to database:", error);
        res.status(500).json({ error: 'Failed to write to database' });
    } finally {
        client.release();
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Node Server running on port ${PORT}`);
});

