// migrations/*.sql ko alphabetical order mein DB par lagata hai. Server par ek baar chalao.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  try {
    for (const file of files) {
      await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
      console.log('applied:', file);
    }
    console.log('migrations ok');
  } catch (err) {
    console.error('migration fail:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
