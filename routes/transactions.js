const express = require('express');
const router = express.Router();
const db = require('../lib/db');

const ALLOWED_TYPES = ['income', 'expense'];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateTransaction(payload, isUpdate) {
  const errors = [];

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'amount')) {
    if (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount)) {
      errors.push('amount must be a valid number');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'type')) {
    if (typeof payload.type !== 'string' || !ALLOWED_TYPES.includes(payload.type.toLowerCase())) {
      errors.push('type must be income or expense');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'category')) {
    if (typeof payload.category !== 'string' || payload.category.trim().length === 0) {
      errors.push('category must be a non-empty string');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'date')) {
    if (!isValidDate(payload.date)) {
      errors.push('date must be a valid date string');
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'note') && payload.note !== undefined) {
    if (typeof payload.note !== 'string') {
      errors.push('note must be a string');
    }
  }

  return errors;
}

function normalizeTransaction(payload) {
  const normalized = {};
  if (Object.prototype.hasOwnProperty.call(payload, 'amount')) {
    normalized.amount = payload.amount;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
    normalized.type = payload.type.toLowerCase();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
    normalized.category = payload.category.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'date')) {
    normalized.date = payload.date;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'note')) {
    normalized.note = payload.note;
  }
  return normalized;
}

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      date: req.body.date,
      note: req.body.note ?? ''
    };

    const errors = validateTransaction(payload, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const normalized = normalizeTransaction(payload);
    const tx = { id: makeId(), ...normalized };
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
    const payload = {};
    ['amount', 'type', 'category', 'date', 'note'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        payload[key] = req.body[key];
      }
    });

    const hasUpdatableField = Object.keys(payload).length > 0;
    if (!hasUpdatableField) {
      return res.status(400).json({ error: 'Provide at least one field to update: amount, type, category, date, note' });
    }

    const errors = validateTransaction(payload, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const patch = normalizeTransaction(payload);
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
