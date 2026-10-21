const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = req.query.status || '';

    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      let ownerId = req.user.id;
      if (req.user.role === 'sub_user') {
        const r = await pool.query('SELECT parent_id FROM users WHERE id = $1', [req.user.id]);
        ownerId = r.rows[0]?.parent_id ?? -1;
      }
      params.push(ownerId);
      conditions.push(`l.customer_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.controller_id ILIKE $${params.length} OR l.pole_number ILIKE $${params.length})`);
    }

    if (status === 'healthy' || status === 'faulty') {
      params.push(status);
      conditions.push(`l.status = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM lights l LEFT JOIN controllers c ON c.id = l.controller_id ${where}`,
      params
    );

    const listParams = [...params, limit, offset];
    const list = await pool.query(
      `SELECT l.id, l.pole_number, l.latitude, l.longitude, l.status, l.is_plugged,
              l.approval_status, c.controller_id, c.control, c.dim, c.fetch_interval, c.last_updated
       FROM lights l
       LEFT JOIN controllers c ON c.id = l.controller_id
       ${where}
       ORDER BY l.id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    res.json({
      total: Number(countResult.rows[0].count),
      page,
      limit,
      lights: list.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/map', auth, async (req, res) => {
  try {
    let where = 'WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL';
    const params = [];

    if (req.user.role !== 'admin') {
      let ownerId = req.user.id;
      if (req.user.role === 'sub_user') {
        const r = await pool.query('SELECT parent_id FROM users WHERE id = $1', [req.user.id]);
        ownerId = r.rows[0]?.parent_id ?? -1;
      }
      params.push(ownerId);
      where += ` AND l.customer_id = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT l.id, l.pole_number, l.latitude, l.longitude, l.status, l.is_plugged,
              c.controller_id, c.control, c.dim
       FROM lights l
       LEFT JOIN controllers c ON c.id = l.controller_id
       ${where}
       ORDER BY l.id`,
      params
    );

    res.json({ lights: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;