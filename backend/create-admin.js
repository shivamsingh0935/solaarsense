// node create-admin.js "Naam" username password
// Password ko file mein nahi, argument mein dete hain - isliye repo mein kuch hash nahi bachta.
const bcrypt = require('bcryptjs');
const pool = require('./db');

const [name, username, password] = process.argv.slice(2);

if (!name || !username || !password) {
  console.error('Usage: node create-admin.js "Name" <username> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('The password must be at least 8 characters long.');
  process.exit(1);
}

(async () => {
  try {
    const clash = await pool.query('SELECT id, role FROM users WHERE username = $1', [username]);
    if (clash.rows.length > 0) {
      console.error(`Username "${username}" already id ${clash.rows[0].id} is present at (role: ${clash.rows[0].role})`);
      console.error('Provide another username, or ask for a reset.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users (name, username, password, role, is_active)
       VALUES ($1, $2, $3, 'admin', TRUE) RETURNING id`,
      [name, username, hash]
    );
    console.log(`Became an admin -> id ${r.rows[0].id}, username ${username}`);
    console.log('Live test: Log in, and you will see data for all users on the dashboard.');
  } catch (err) {
    console.error('fail:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
