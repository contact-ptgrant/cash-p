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
