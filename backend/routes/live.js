const crypto = require('crypto');
const express = require('express');
const auth = require('../middleware/auth');
const realtime = require('../realtime');

const router = express.Router();
const TICKET_TTL_MS = 15000;
const tickets = new Map();

// EventSource Authorization header bhej nahi sakta, isliye JWT URL mein dhalne ke
// badle ek one-time ticket dete hain. Ticket 15s mein marta hai aur use ke baad delete.
router.post('/ticket', auth, (req, res) => {
  const now = Date.now();
  for (const [id, t] of tickets) {
    if (t.exp < now) tickets.delete(id);
  }
  const ticket = crypto.randomBytes(16).toString('hex');
  tickets.set(ticket, { exp: now + TICKET_TTL_MS });
  res.json({ ticket });
});

router.get('/stream', (req, res) => {
  const ticket = tickets.get(req.query.ticket);
  if (!ticket || ticket.exp < Date.now()) {
    return res.status(401).json({ message: 'Stream ticket galat ya expire ho gaya' });
  }
  tickets.delete(req.query.ticket);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const detach = realtime.attach(res);
  req.on('close', detach);
});

module.exports = router;
