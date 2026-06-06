const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

async function ensureFile(collection) {
  const p = path.join(dataDir, `${collection}.json`);
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(p);
  } catch (e) {
    await fs.writeFile(p, '[]', 'utf8');
  }
  return p;
}

async function readAll(collection) {
  const p = await ensureFile(collection);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeAll(collection, items) {
  const p = await ensureFile(collection);
  await fs.writeFile(p, JSON.stringify(items, null, 2), 'utf8');
}

async function getAll(collection) {
  return await readAll(collection);
}

async function getById(collection, id) {
  const items = await readAll(collection);
  return items.find(i => i.id === id) || null;
}

async function create(collection, obj) {
  const items = await readAll(collection);
  items.push(obj);
  await writeAll(collection, items);
  return obj;
}

async function update(collection, id, patch) {
  const items = await readAll(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = Object.assign({}, items[idx], patch);
  await writeAll(collection, items);
  return items[idx];
}

async function remove(collection, id) {
  const items = await readAll(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  await writeAll(collection, items);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
