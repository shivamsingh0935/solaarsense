const express = require('express');
const pool = require('../db');

const router = express.Router();

// Device/firmware bina login ke data bhejta hai, isliye auth middleware nahi
const stripQuotes = (v) => (typeof v === 'string' ? v.replace(/^'+|'+$/g, '') : v);
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
};

router.get('/', async (req, res) => {
  const data = {
    id: stripQuotes(req.query.ID),
    bv: toNumber(req.query.BV),
    bi: toNumber(req.query.BI),
    sv: toNumber(req.query.SV),
    si: toNumber(req.query.SI),
    lv: toNumber(req.query.LV),
    li: toNumber(req.query.LI),
    state: stripQuotes(req.query.STATE),
    dod: parseInt(stripQuotes(req.query.DOD), 10) || 0,
    conf: stripQuotes(req.query.CONF),
    evnt: stripQuotes(req.query.EVNT),
    mob: stripQuotes(req.query.MOB),
  };

  if (!data.id) {
    return res.status(400).json({ status: 'error', message: 'ID missing' });
  }

  console.log(`[controller-data] ${new Date().toISOString()} ${JSON.stringify(data)}`);

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const isFaulty = data.evnt && data.evnt !== '0';
      const status = isFaulty ? 'faulty' : 'healthy';
      const control = data.state === 'OFF' || data.state === 'ON' ? data.state : null;

      const existing = await client.query(
        'SELECT id FROM controllers WHERE controller_id = $1',
        [data.id]
      );

      let controllerId;
      if (existing.rows.length > 0) {
        controllerId = existing.rows[0].id;
        await client.query(
          `UPDATE controllers SET
             status = $1,
             control = COALESCE($2, control),
             last_updated = NOW()
           WHERE id = $3`,
          [status, control, controllerId]
        );
        await client.query(
          'UPDATE lights SET status = $1 WHERE controller_id = $2',
          [status, controllerId]
        );
      } else {
        const c = await client.query(
          `INSERT INTO controllers (controller_id, status, control)
           VALUES ($1, $2, $3) RETURNING id`,
          [data.id, status, control || 'ON']
        );
        controllerId = c.rows[0].id;

        const cust = await client.query(
          `SELECT id FROM users WHERE role = 'customer' AND is_active = TRUE ORDER BY id LIMIT 1`
        );
        const customerId = cust.rows.length > 0 ? cust.rows[0].id : null;

        await client.query(
          `INSERT INTO lights (controller_id, customer_id, pole_number, status, approval_status)
           VALUES ($1, $2, $3, $4, 'approved')`,
          [controllerId, customerId, 'POLE-' + data.id, status]
        );
      }

      await client.query('COMMIT');
      res.json({ status: 'ok', received: data, saved: true });
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {});
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[controller-data] save error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
