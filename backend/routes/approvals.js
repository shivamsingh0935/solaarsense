const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

async function getOwnerId(req) {
  if (req.user.role === 'admin') return null;
  if (req.user.role === 'sub_user' || req.user.role === 'field_engineer') {
    const r = await pool.query('SELECT parent_id FROM users WHERE id = $1', [req.user.id]);
    return r.rows[0]?.parent_id ?? -1;
  }
  return req.user.id;
}

function canWrite(req, res) {
  if (!['admin', 'customer'].includes(req.user.role)) {
    res.status(403).json({ message: 'Aapko ye karne ki permission nahi hai' });
    return false;
  }
  return true;
}

function actionStatus(action) {
  if (action === 'approve') return 'approved';
  if (action === 'reject') return 'rejected';
  return null;
}

router.get('/pending-lights', auth, async (req, res) => {
  try {
    const owner = await getOwnerId(req);
    const params = [];
    let extra = '';
    if (owner !== null) {
      params.push(owner);
      extra = ` AND l.customer_id = $1`;
    }
    const result = await pool.query(
      `SELECT l.id, l.pole_number, l.latitude, l.longitude, l.status, c.controller_id
       FROM lights l
       LEFT JOIN controllers c ON c.id = l.controller_id
       WHERE l.approval_status = 'pending'${extra}
       ORDER BY l.id DESC`,
      params
    );
    res.json({ lights: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/lights/bulk', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  try {
    const { ids, action } = req.body;
    const newStatus = actionStatus(action);
    if (!newStatus) return res.status(400).json({ message: 'action galat hai' });
    if (!Array.isArray(ids) || ids.length === 0 || ids.some((i) => !Number.isInteger(Number(i)))) {
      return res.status(400).json({ message: 'Koi light chuni nahi gayi' });
    }

    const owner = await getOwnerId(req);
    const params = [newStatus, ids.map(Number)];
    let extra = '';
    if (owner !== null) {
      params.push(owner);
      extra = ' AND customer_id = $3';
    }
    const result = await pool.query(
      `UPDATE lights SET approval_status = $1
       WHERE id = ANY($2) AND approval_status = 'pending'${extra}
       RETURNING id`,
      params
    );
    res.json({ updated: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/submissions', auth, async (req, res) => {
  try {
    const owner = await getOwnerId(req);
    const conditions = [];
    const params = [];
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) {
      params.push(req.query.status);
      conditions.push(`s.status = $${params.length}`);
    }
    if (owner !== null) {
      params.push(owner);
      conditions.push(`l.customer_id = $${params.length}`);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT s.id, s.remarks, s.status, s.submitted_at, s.photo_url,
              u.name AS engineer, l.pole_number, c.controller_id
       FROM fe_submissions s
       JOIN lights l ON l.id = s.light_id
       LEFT JOIN controllers c ON c.id = l.controller_id
       LEFT JOIN users u ON u.id = s.engineer_id
       ${where}
       ORDER BY s.submitted_at DESC`,
      params
    );
    res.json({ rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submissions', auth, async (req, res) => {
  if (req.user.role !== 'field_engineer') {
    return res.status(403).json({ message: 'Sirf field engineer submission bhej sakta hai' });
  }
  try {
    const { light_id, remarks, photo_url } = req.body;
    if (!Number.isInteger(Number(light_id))) {
      return res.status(400).json({ message: 'Light chuno' });
    }
    const owner = await getOwnerId(req);
    const params = [Number(light_id)];
    let extra = '';
    if (owner !== null) {
      params.push(owner);
      extra = ' AND l.customer_id = $2';
    }
    const light = await pool.query(`SELECT l.id FROM lights l WHERE l.id = $1${extra}`, params);
    if (light.rows.length === 0) {
      return res.status(404).json({ message: 'Light nahi mili' });
    }
    const result = await pool.query(
      `INSERT INTO fe_submissions (engineer_id, light_id, remarks, photo_url)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.id, Number(light_id), remarks || null, photo_url || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submissions/:id', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  try {
    const newStatus = actionStatus(req.body.action);
    if (!newStatus) return res.status(400).json({ message: 'action galat hai' });

    const owner = await getOwnerId(req);
    const params = [newStatus, req.params.id];
    let extra = '';
    if (owner !== null) {
      params.push(owner);
      extra = ' AND l.customer_id = $3';
    }
    const result = await pool.query(
      `UPDATE fe_submissions s SET status = $1
       FROM lights l
       WHERE s.id = $2 AND l.id = s.light_id AND s.status = 'pending'${extra}
       RETURNING s.id`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission nahi mili ya pehle hi ho chuki hai' });
    }
    res.json({ message: 'Ho gaya' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/swaps', auth, async (req, res) => {
  try {
    const owner = await getOwnerId(req);
    const conditions = [];
    const params = [];
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) {
      params.push(req.query.status);
      conditions.push(`w.status = $${params.length}`);
    }
    if (owner !== null) {
      params.push(owner);
      conditions.push(`l.customer_id = $${params.length}`);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT w.id, w.status, w.created_at, l.pole_number,
              oc.controller_id AS old_controller, nc.controller_id AS new_controller,
              u.name AS requested_by
       FROM swap_requests w
       JOIN lights l ON l.id = w.light_id
       LEFT JOIN controllers oc ON oc.id = w.old_controller_id
       LEFT JOIN controllers nc ON nc.id = w.new_controller_id
       LEFT JOIN users u ON u.id = w.requested_by
       ${where}
       ORDER BY w.created_at DESC`,
      params
    );
    res.json({ rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/swaps', auth, async (req, res) => {
  if (req.user.role !== 'field_engineer') {
    return res.status(403).json({ message: 'Sirf field engineer swap request bhej sakta hai' });
  }
  try {
    const { light_id, new_controller_id } = req.body;
    if (!Number.isInteger(Number(light_id))) {
      return res.status(400).json({ message: 'Light chuno' });
    }
    const newCid = String(new_controller_id || '').trim();
    if (!newCid) {
      return res.status(400).json({ message: 'Naya controller ID zaruri hai' });
    }

    const owner = await getOwnerId(req);
    const params = [Number(light_id)];
    let extra = '';
    if (owner !== null) {
      params.push(owner);
      extra = ' AND l.customer_id = $2';
    }
    const light = await pool.query(
      `SELECT l.id, l.controller_id FROM lights l WHERE l.id = $1${extra}`,
      params
    );
    if (light.rows.length === 0) {
      return res.status(404).json({ message: 'Light nahi mili' });
    }

    const ctrl = await pool.query('SELECT id FROM controllers WHERE controller_id = $1', [newCid]);
    if (ctrl.rows.length === 0) {
      return res.status(404).json({ message: 'Ye controller ID exist nahi karta' });
    }

    const result = await pool.query(
      `INSERT INTO swap_requests (light_id, old_controller_id, new_controller_id, requested_by)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [light.rows[0].id, light.rows[0].controller_id, ctrl.rows[0].id, req.user.id]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/swaps/:id', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  const client = await pool.connect();
  try {
    const newStatus = actionStatus(req.body.action);
    if (!newStatus) return res.status(400).json({ message: 'action galat hai' });

    const owner = await getOwnerId(req);
    await client.query('BEGIN');

    const found = await client.query(
      `SELECT w.id, w.light_id, w.new_controller_id, w.status, l.customer_id
       FROM swap_requests w JOIN lights l ON l.id = w.light_id
       WHERE w.id = $1 FOR UPDATE OF w`,
      [req.params.id]
    );
    const sw = found.rows[0];
    if (!sw || (owner !== null && sw.customer_id !== owner)) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Request nahi mili' });
    }
    if (sw.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Ye request pehle hi ho chuki hai' });
    }

    if (newStatus === 'approved') {
      if (!sw.new_controller_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Naya controller nahi diya gaya' });
      }
      const used = await client.query(
        'SELECT 1 FROM lights WHERE controller_id = $1 AND id <> $2',
        [sw.new_controller_id, sw.light_id]
      );
      if (used.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Ye naya controller pehle se kisi aur light par laga hai' });
      }
      await client.query('UPDATE lights SET controller_id = $1 WHERE id = $2', [sw.new_controller_id, sw.light_id]);
    }

    await client.query('UPDATE swap_requests SET status = $1 WHERE id = $2', [newStatus, sw.id]);
    await client.query('COMMIT');
    res.json({ message: 'Ho gaya' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
