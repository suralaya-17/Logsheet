const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Init DB
const db = new sqlite3.Database('./db.sqlite');

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS power_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bay TEXT,
  tanggal TEXT,
  jam TEXT,
  arus REAL,
  daya REAL,
  daya_reaktif REAL,
  tegangan REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// API endpoint to save data
app.post('/api/save', (req, res) => {
  const { bay, tanggal, jam, arus, daya, daya_reaktif, tegangan } = req.body;
  const stmt = db.prepare(`INSERT INTO power_logs (bay, tanggal, jam, arus, daya, daya_reaktif, tegangan) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmt.run([bay, tanggal, jam, arus, daya, daya_reaktif, tegangan], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// API endpoint to get all data (optional)
app.get('/api/data', (req, res) => {
  db.all(`SELECT * FROM power_logs ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Endpoint hapus data berdasarkan ID
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM power_logs WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/data', (req, res) => {
  db.run('DELETE FROM power_logs', [], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
