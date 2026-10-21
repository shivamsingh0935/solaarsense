const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let filter = '';
    let params = [];

    if (req.user.role !== 'admin') {
      let ownerId = req.user.id;
      if (req.user.role === 'sub_user') {
        const r = await pool.query('SELECT parent_id FROM users WHERE id = $1', [req.user.id]);
        ownerId = r.rows[0]?.parent_id ?? -1;
      }
      filter = 'WHERE l.customer_id = $1';
      params = [ownerId];
    }

    const lights = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE l.status = 'healthy') AS healthy,
              COUNT(*) FILTER (WHERE l.status = 'faulty') AS faulty,
              COUNT(*) FILTER (WHERE l.is_plugged = FALSE) AS unplugged
       FROM lights l ${filter}`,
      params
    );

    const places = await pool.query(
      `SELECT COUNT(DISTINCT d.id) AS districts,
              COUNT(DISTINCT b.id) AS blocks,
              COUNT(DISTINCT p.id) AS panchayats,
              COUNT(DISTINCT w.id) AS wards
       FROM lights l
       JOIN wards w ON w.id = l.ward_id
       JOIN panchayats p ON p.id = w.panchayat_id
       JOIN blocks b ON b.id = p.block_id
       JOIN districts d ON d.id = b.district_id
       ${filter}`,
      params
    );

    const energy = await pool.query(
      `SELECT COALESCE(SUM(e.energy_kwh), 0) AS kwh
       FROM light_working_days e
       JOIN lights l ON l.id = e.light_id
       ${filter}`,
      params
    );

    const ctrlPie = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE c.status = 'healthy') AS healthy,
              COUNT(*) FILTER (WHERE c.status = 'faulty') AS faulty
       FROM controllers c
       JOIN lights l ON l.controller_id = c.id
       ${filter}`,
      params
    );

    const last5 = await pool.query(
      `SELECT c.controller_id, c.status, c.fetch_interval, c.control, c.dim, c.created_at
       FROM controllers c
       JOIN lights l ON l.controller_id = c.id
       ${filter}
       ORDER BY c.created_at DESC, c.id DESC
       LIMIT 5`,
      params
    );

    const lastUpdated = await pool.query(
      `SELECT c.controller_id, c.status, c.fetch_interval, c.control, c.dim, c.last_updated
       FROM controllers c
       JOIN lights l ON l.controller_id = c.id
       ${filter}
       ORDER BY c.last_updated DESC
       LIMIT 1`,
      params
    );

    const kwh = Number(energy.rows[0].kwh);

    res.json({
      cards: {
        solarStreetLights: Number(lights.rows[0].total),
        healthyLights: Number(lights.rows[0].healthy),
        faultyLights: Number(lights.rows[0].faulty),
        unpluggedLights: Number(lights.rows[0].unplugged),
        districts: Number(places.rows[0].districts),
        blocks: Number(places.rows[0].blocks),
        panchayats: Number(places.rows[0].panchayats),
        wards: Number(places.rows[0].wards),
        energySavingsKwh: Number(kwh.toFixed(1)),
        co2ReducedKg: Number((kwh * 0.95).toFixed(1)),
      },
      pie: {
        healthy: Number(ctrlPie.rows[0].healthy),
        faulty: Number(ctrlPie.rows[0].faulty),
      },
      lastAddedControllers: last5.rows,
      lastUpdatedController: lastUpdated.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;