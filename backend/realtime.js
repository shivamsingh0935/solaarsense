const pool = require('./db');

const CHANNEL = 'ss_data_changed';
const streams = new Set();

let listener = null;
let restartTimer = null;

// Sirf table ka naam broadcast hota hai, rows ka data nahi.
// Har browser apna scoped REST endpoint dobara poochhta hai, toh role-based filtering bani rehti hai.
function broadcast(table) {
  const frame = `event: change\ndata: ${JSON.stringify({ table })}\n\n`;
  for (const res of streams) {
    try {
      res.write(frame);
    } catch {
      streams.delete(res);
    }
  }
}

function attach(res) {
  streams.add(res);
  res.write('event: ready\ndata: {}\n\n');
  return () => streams.delete(res);
}

function scheduleRestart() {
  if (restartTimer) return;
  restartTimer = setTimeout(() => {
    restartTimer = null;
    connectListener();
  }, 3000);
}

function dropClient(client) {
  if (listener !== client) return;
  listener = null;
  client.release();
  scheduleRestart();
}

async function connectListener() {
  if (listener) return;
  try {
    const client = await pool.connect();
    client.on('notification', (msg) => broadcast(msg.payload));
    client.once('error', () => dropClient(client));
    client.once('end', () => dropClient(client));
    await client.query(`LISTEN ${CHANNEL}`);
    listener = client;
    console.log('realtime: LISTEN', CHANNEL);
  } catch (err) {
    console.error('realtime listener connect failed:', err.message);
    scheduleRestart();
  }
}

// Proxy/idle timeout se connection na tute — har 25s ek comment frame.
const heartbeat = setInterval(() => {
  for (const res of streams) {
    try {
      res.write(': ping\n\n');
    } catch {
      streams.delete(res);
    }
  }
}, 25000);
heartbeat.unref();

module.exports = { connectListener, attach };
