const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const ALLOWED_ROLES = ['sub_user', 'field_engineer'];

function ownerIdOf(req) {
  return req.user.id;
}

router.get('/', auth, async (req, res) => {
  try {
    const role = req.query.role;
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'role galat hai' });
    }

    let result;
    if (req.user.role === 'admin') {
      result = await pool.query(
        `SELECT id, name, username, phone, role, is_active, created_at
         FROM users WHERE role = $1 ORDER BY id DESC`,
        [role]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, username, phone, role, is_active, created_at
         FROM users WHERE role = $1 AND parent_id = $2 ORDER BY id DESC`,
        [role, ownerIdOf(req)]
      );
    }
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!['admin', 'customer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Aapko user banane ki permission nahi hai' });
    }

    const { name, username, password, phone, role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'role galat hai' });
    }
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username aur password zaruri hain' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password kam se kam 6 akshar ka ho' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Ye username pehle se maujood hai' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, username, password, role, parent_id, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, username, phone, role, is_active, created_at`,
      [name, username, hash, role, ownerIdOf(req), phone || null]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    if (!['admin', 'customer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission nahi hai' });
    }

    let result;
    if (req.user.role === 'admin') {
      result = await pool.query(
        `UPDATE users SET is_active = NOT is_active
         WHERE id = $1 AND role = ANY($2) RETURNING id, is_active`,
        [req.params.id, ALLOWED_ROLES]
      );
    } else {
      result = await pool.query(
        `UPDATE users SET is_active = NOT is_active
         WHERE id = $1 AND parent_id = $2 AND role = ANY($3) RETURNING id, is_active`,
        [req.params.id, ownerIdOf(req), ALLOWED_ROLES]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User nahi mila' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
