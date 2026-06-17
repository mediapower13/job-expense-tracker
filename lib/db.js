const fs = require('fs').promises;
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const dataDir = path.join(__dirname, '..', 'data');

// Connection is optional: if MONGODB_URI is provided we use MongoDB, else file fallback
const MONGODB_URI = process.env.MONGODB_URI || null;
let mongoClient = null;
let mongoDb = null;

async function connectMongo() {
  if (!MONGODB_URI) return null;
  if (mongoDb) return mongoDb;
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  // Use database from URI or default to 'app'
  const dbName = mongoClient.db().databaseName || 'app';
  mongoDb = mongoClient.db(dbName);
  return mongoDb;
}

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

async function readAllFile(collection) {
  const p = await ensureFile(collection);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeAllFile(collection, items) {
  const p = await ensureFile(collection);
  await fs.writeFile(p, JSON.stringify(items, null, 2), 'utf8');
}

// Public API: getAll, getById, create, update, remove
async function getAll(collection) {
  const db = await connectMongo();
  if (db) {
    const docs = await db.collection(collection).find({}, { projection: { _id: 0 } }).toArray();
    return docs;
  }
  return await readAllFile(collection);
}

async function getById(collection, id) {
  const db = await connectMongo();
  if (db) {
    // try to find by id field first, fallback to _id
    let doc = await db.collection(collection).findOne({ id });
    if (!doc) {
      try {
        doc = await db.collection(collection).findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // ignore invalid ObjectId
      }
    }
    if (!doc) return null;
    delete doc._id;
    return doc;
  }
  return await (async () => {
    const items = await readAllFile(collection);
    return items.find(i => i.id === id) || null;
  })();
}

async function create(collection, obj) {
  const db = await connectMongo();
  if (db) {
    const insert = Object.assign({}, obj);
    // do not attach _id, keep provided id if exists
    await db.collection(collection).insertOne(insert);
    const res = Object.assign({}, insert);
    delete res._id;
    return res;
  }
  const items = await readAllFile(collection);
  items.push(obj);
  await writeAllFile(collection, items);
  return obj;
}

async function update(collection, id, patch) {
  const db = await connectMongo();
  if (db) {
    let result = await db.collection(collection).findOneAndUpdate(
      { id },
      { $set: patch },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      try {
        const oid = new ObjectId(id);
        result = await db.collection(collection).findOneAndUpdate(
          { _id: oid },
          { $set: patch },
          { returnDocument: 'after' }
        );
      } catch (e) {}
    }
    if (!result.value) return null;
    const doc = result.value;
    delete doc._id;
    return doc;
  }
  const items = await readAllFile(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = Object.assign({}, items[idx], patch);
  await writeAllFile(collection, items);
  return items[idx];
}

async function remove(collection, id) {
  const db = await connectMongo();
  if (db) {
    const res = await db.collection(collection).deleteOne({ id });
    if (res.deletedCount && res.deletedCount > 0) return true;
    try {
      const oid = new ObjectId(id);
      const res2 = await db.collection(collection).deleteOne({ _id: oid });
      return res2.deletedCount && res2.deletedCount > 0;
    } catch (e) {
      return false;
    }
  }
  const items = await readAllFile(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  await writeAllFile(collection, items);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
