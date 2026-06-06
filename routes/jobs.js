const express = require('express');
const router = express.Router();
const db = require('../lib/db');

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

router.post('/', async (req, res, next) => {
  try {
    const { company, role, dateApplied, status } = req.body;
    if (!company || !role || !dateApplied || !status) {
      return res.status(400).json({ error: 'company, role, dateApplied, status required' });
    }
    const job = {
      id: makeId(),
      company,
      role,
      dateApplied,
      status
    };
    await db.create('jobs', job);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const items = await db.getAll('jobs');
    res.json(items);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await db.getById('jobs', req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const patch = req.body;
    const updated = await db.update('jobs', req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await db.remove('jobs', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
