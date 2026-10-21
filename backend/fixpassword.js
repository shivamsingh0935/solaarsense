const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  const hash = await bcrypt.hash('temp123', 10);
  await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'new_premier']);
  console.log('Password hashed ho gaya');
  process.exit();
})();