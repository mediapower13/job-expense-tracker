const express = require('express');
const router = express.Router();
const db = require('../lib/db');

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

router.post('/', async (req, res, next) => {
  try {
    const { amount, type, category, date, note } = req.body;
    if (typeof amount !== 'number' || !['income','expense'].includes(type) || !category || !date) {
      return res.status(400).json({ error: 'amount (number), type (income|expense), category, date required' });
    }
    const tx = { id: makeId(), amount, type, category, date, note: note || '' };
    await db.create('transactions', tx);
    res.status(201).json(tx);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const items = await db.getAll('transactions');
    res.json(items);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await db.getById('transactions', req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const patch = req.body;
    const updated = await db.update('transactions', req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await db.remove('transactions', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
