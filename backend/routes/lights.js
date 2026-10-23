const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

async function ownerWhere(req, params, conditions) {
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

function canWrite(req, res) {
  if (!['admin', 'customer'].includes(req.user.role)) {
    res.status(403).json({ message: 'Aapko ye karne ki permission nahi hai' });
    return false;
  }
  return true;
}

function badNumber(v, min, max) {
  if (v === undefined || v === null || v === '') return false;
  const n = Number(v);
  return Number.isNaN(n) || n < min || n > max;
}

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = req.query.status || '';

    const conditions = [];
    const params = [];
    await ownerWhere(req, params, conditions);

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

    res.json({ total: Number(countResult.rows[0].count), page, limit, lights: list.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/map', auth, async (req, res) => {
  try {
    const conditions = ['l.latitude IS NOT NULL', 'l.longitude IS NOT NULL'];
    const params = [];
    await ownerWhere(req, params, conditions);

    const result = await pool.query(
      `SELECT l.id, l.pole_number, l.latitude, l.longitude, l.status, l.is_plugged,
              c.controller_id, c.control, c.dim
       FROM lights l
       LEFT JOIN controllers c ON c.id = l.controller_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY l.id`,
      params
    );
    res.json({ lights: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  const client = await pool.connect();
  try {
    const { controller_id, pole_number, latitude, longitude, status, is_plugged, dim, control } = req.body;

    if (!controller_id || !String(controller_id).trim()) {
      return res.status(400).json({ message: 'Controller ID zaruri hai' });
    }
    if (!pole_number || !String(pole_number).trim()) {
      return res.status(400).json({ message: 'Pole number zaruri hai' });
    }
    if (badNumber(latitude, -90, 90) || badNumber(longitude, -180, 180)) {
      return res.status(400).json({ message: 'Latitude ya longitude galat hai' });
    }
    if (badNumber(dim, 0, 100)) {
      return res.status(400).json({ message: 'DIM 0 se 100 ke beech hona chahiye' });
    }
    if (status && !['healthy', 'faulty'].includes(status)) {
      return res.status(400).json({ message: 'Status galat hai' });
    }

    let customerId = req.user.id;
    if (req.user.role === 'admin') {
      customerId = req.body.customer_id;
      if (!customerId) return res.status(400).json({ message: 'Admin ko customer_id dena zaruri hai' });
    }

    const cid = String(controller_id).trim();
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT c.id, (SELECT COUNT(*) FROM lights WHERE controller_id = c.id) AS used
       FROM controllers c WHERE c.controller_id = $1`,
      [cid]
    );

    let controllerPk;
    if (existing.rows.length > 0) {
      if (Number(existing.rows[0].used) > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Ye controller ID pehle se kisi light se juda hai' });
      }
      controllerPk = existing.rows[0].id;
    } else {
      const c = await client.query(
        `INSERT INTO controllers (controller_id, status, control, dim)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [cid, status || 'healthy', control === 'OFF' ? 'OFF' : 'ON', dim === undefined || dim === '' ? 100 : Number(dim)]
      );
      controllerPk = c.rows[0].id;
    }

    const l = await client.query(
      `INSERT INTO lights (controller_id, customer_id, pole_number, latitude, longitude, status, is_plugged, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved') RETURNING id`,
      [
        controllerPk,
        customerId,
        String(pole_number).trim(),
        latitude === undefined || latitude === '' ? null : Number(latitude),
        longitude === undefined || longitude === '' ? null : Number(longitude),
        status || 'healthy',
        is_plugged === undefined ? true : Boolean(is_plugged),
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ id: l.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

router.put('/:id', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  const client = await pool.connect();
  try {
    const { pole_number, latitude, longitude, status, is_plugged, dim, control } = req.body;

    if (pole_number !== undefined && !String(pole_number).trim()) {
      return res.status(400).json({ message: 'Pole number khali nahi ho sakta' });
    }
    if (badNumber(latitude, -90, 90) || badNumber(longitude, -180, 180)) {
      return res.status(400).json({ message: 'Latitude ya longitude galat hai' });
    }
    if (badNumber(dim, 0, 100)) {
      return res.status(400).json({ message: 'DIM 0 se 100 ke beech hona chahiye' });
    }
    if (status && !['healthy', 'faulty'].includes(status)) {
      return res.status(400).json({ message: 'Status galat hai' });
    }

    const params = [req.params.id];
    const conditions = ['l.id = $1'];
    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      conditions.push(`l.customer_id = $${params.length}`);
    }

    await client.query('BEGIN');
    const found = await client.query(
      `SELECT l.id, l.controller_id FROM lights l WHERE ${conditions.join(' AND ')}`,
      params
    );
    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Light nahi mili' });
    }

    await client.query(
      `UPDATE lights SET
         pole_number = COALESCE($1, pole_number),
         latitude = COALESCE($2, latitude),
         longitude = COALESCE($3, longitude),
         status = COALESCE($4, status),
         is_plugged = COALESCE($5, is_plugged)
       WHERE id = $6`,
      [
        pole_number === undefined ? null : String(pole_number).trim(),
        latitude === undefined || latitude === '' ? null : Number(latitude),
        longitude === undefined || longitude === '' ? null : Number(longitude),
        status || null,
        is_plugged === undefined ? null : Boolean(is_plugged),
        req.params.id,
      ]
    );

    if (found.rows[0].controller_id) {
      await client.query(
        `UPDATE controllers SET
           control = COALESCE($1, control),
           dim = COALESCE($2, dim),
           status = COALESCE($3, status),
           last_updated = NOW()
         WHERE id = $4`,
        [
          control === 'ON' || control === 'OFF' ? control : null,
          dim === undefined || dim === '' ? null : Number(dim),
          status || null,
          found.rows[0].controller_id,
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Light update ho gayi' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (!canWrite(req, res)) return;
  const client = await pool.connect();
  try {
    const params = [req.params.id];
    const conditions = ['l.id = $1'];
    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      conditions.push(`l.customer_id = $${params.length}`);
    }

    await client.query('BEGIN');
    const found = await client.query(
      `SELECT l.id, l.controller_id FROM lights l WHERE ${conditions.join(' AND ')}`,
      params
    );
    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Light nahi mili' });
    }

    const lightId = found.rows[0].id;
    const ctrl = found.rows[0].controller_id;

    await client.query('DELETE FROM light_working_days WHERE light_id = $1', [lightId]);
    await client.query('DELETE FROM fault_logs WHERE light_id = $1', [lightId]);
    await client.query('DELETE FROM fe_submissions WHERE light_id = $1', [lightId]);
    await client.query('DELETE FROM swap_requests WHERE light_id = $1', [lightId]);
    await client.query('DELETE FROM lights WHERE id = $1', [lightId]);

    if (ctrl) {
      const others = await client.query('SELECT COUNT(*) FROM lights WHERE controller_id = $1', [ctrl]);
      if (Number(others.rows[0].count) === 0) {
        await client.query('DELETE FROM swap_requests WHERE old_controller_id = $1 OR new_controller_id = $1', [ctrl]);
        await client.query('DELETE FROM controllers WHERE id = $1', [ctrl]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Light hat gayi' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
