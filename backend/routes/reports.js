const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

async function ownerFilter(req, params, conditions) {
  if (req.user.role !== 'admin') {
    let ownerId = req.user.id;
    if (req.user.role === 'sub_user') {
      const r = await pool.query('SELECT parent_id FROM users WHERE id = $1', [req.user.id]);
      ownerId = r.rows[0]?.parent_id ?? -1;
    }
    params.push(ownerId);
    conditions.push(`l.customer_id = $${params.length}`);
  }
}

router.get('/working-days', auth, async (req, res) => {
  try {
    const conditions = [];
    const params = [];
    await ownerFilter(req, params, conditions);

    if (req.query.from) {
      params.push(req.query.from);
      conditions.push(`e.work_date >= $${params.length}`);
    }
    if (req.query.to) {
      params.push(req.query.to);
      conditions.push(`e.work_date <= $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(
      `SELECT l.id, l.pole_number, c.controller_id,
              COUNT(e.id) AS working_days,
              COALESCE(SUM(e.working_hours), 0) AS total_hours,
              COALESCE(SUM(e.energy_kwh), 0) AS total_kwh
       FROM lights l
       LEFT JOIN controllers c ON c.id = l.controller_id
       LEFT JOIN light_working_days e ON e.light_id = l.id
       ${where}
       GROUP BY l.id, l.pole_number, c.controller_id
       ORDER BY l.id`,
      params
    );

    res.json({
      rows: result.rows.map((r) => ({
        id: r.id,
        pole_number: r.pole_number,
        controller_id: r.controller_id,
        working_days: Number(r.working_days),
        total_hours: Number(r.total_hours),
        total_kwh: Number(Number(r.total_kwh).toFixed(2)),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/fault-logs', auth, async (req, res) => {
  try {
    const conditions = [];
    const params = [];
    await ownerFilter(req, params, conditions);

    if (req.query.status === 'pending') conditions.push('f.rectified_at IS NULL');
    if (req.query.status === 'rectified') conditions.push('f.rectified_at IS NOT NULL');

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(
      `SELECT f.id, f.fault_type, f.reported_at, f.rectified_at,
              l.pole_number, c.controller_id, u.name AS rectified_by
       FROM fault_logs f
       JOIN lights l ON l.id = f.light_id
       LEFT JOIN controllers c ON c.id = l.controller_id
       LEFT JOIN users u ON u.id = f.rectified_by
       ${where}
       ORDER BY f.reported_at DESC`,
      params
    );

    res.json({ rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
