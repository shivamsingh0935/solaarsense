const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'SolarSense' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM lights');
    res.json({ db: 'connected', total_lights: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/lights', require('./routes/lights'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
