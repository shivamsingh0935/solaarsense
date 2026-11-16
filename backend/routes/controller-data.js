const express = require('express');

const router = express.Router();

// Device/firmware bina login ke data bhejta hai, isliye auth middleware nahi
const stripQuotes = (v) => (typeof v === 'string' ? v.replace(/^'+|'+$/g, '') : v);
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
};

router.get('/', (req, res) => {
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
  // Next step: is data ko PostgreSQL mein save karna
  res.json({ status: 'ok', received: data });
});

module.exports = router;
