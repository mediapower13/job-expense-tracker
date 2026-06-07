const express = require('express');
const router = express.Router();
const db = require('../lib/db');

const ALLOWED_STATUSES = ['applied', 'interview', 'offer', 'rejected', 'hired'];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateJob(payload, isUpdate) {
  const errors = [];

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'company')) {
    if (typeof payload.company !== 'string' || payload.company.trim().length === 0) {
      errors.push('company must be a non-empty string');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'role')) {
    if (typeof payload.role !== 'string' || payload.role.trim().length === 0) {
      errors.push('role must be a non-empty string');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'dateApplied')) {
    if (!isValidDate(payload.dateApplied)) {
      errors.push('dateApplied must be a valid date string');
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'status')) {
    if (typeof payload.status !== 'string' || !ALLOWED_STATUSES.includes(payload.status.toLowerCase())) {
      errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

  return errors;
}

function normalizeJob(payload) {
  const normalized = {};
  if (Object.prototype.hasOwnProperty.call(payload, 'company')) {
    normalized.company = payload.company.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'role')) {
    normalized.role = payload.role.trim();
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'dateApplied')) {
    normalized.dateApplied = payload.dateApplied;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    normalized.status = payload.status.toLowerCase();
  }
  return normalized;
}

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      company: req.body.company,
      role: req.body.role,
      dateApplied: req.body.dateApplied,
      status: req.body.status
    };

    const errors = validateJob(payload, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const normalized = normalizeJob(payload);
    const job = {
      id: makeId(),
      company: normalized.company,
      role: normalized.role,
      dateApplied: normalized.dateApplied,
      status: normalized.status
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
    const payload = {};
    ['company', 'role', 'dateApplied', 'status'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        payload[key] = req.body[key];
      }
    });

    const hasUpdatableField = Object.keys(payload).length > 0;
    if (!hasUpdatableField) {
      return res.status(400).json({ error: 'Provide at least one field to update: company, role, dateApplied, status' });
    }

    const errors = validateJob(payload, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const patch = normalizeJob(payload);
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
