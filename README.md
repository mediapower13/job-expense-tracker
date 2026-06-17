
API Endpoints

Jobs (Assignment 1)

- POST /jobs — body: `{ company, role, dateApplied, status }`
- GET /jobs — list all
- GET /jobs/:id — get one
- PUT /jobs/:id — update (partial OK)
- DELETE /jobs/:id — delete

Transactions (Assignment 2)

- POST /transactions — body: `{ amount, type: 'income'|'expense', category, date, note? }` (amount must be number)
- GET /transactions — list all
- GET /transactions/:id
- PUT /transactions/:id
- DELETE /transactions/:id


Create a job:

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"company":"Acme","role":"Backend","dateApplied":"2026-06-01","status":"applied"}'
```

Create a transaction:

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":250.5,"type":"income","category":"freelance","date":"2026-06-02","note":"project"}'
```

MongoDB Integration
-------------------

This project supports connecting to a MongoDB database. By default the app will continue to use local JSON files under the `data/` folder. To enable MongoDB, set the `MONGODB_URI` environment variable before running the server. Example using a local MongoDB instance:

```bash
export MONGODB_URI="mongodb://localhost:27017/job-expense-tracker"
npm start
```

On Windows (PowerShell):

```powershell
$env:MONGODB_URI = 'mongodb://localhost:27017/job-expense-tracker'
npm start
```

When connected, both `GET /jobs` and `POST /jobs` (and the transactions routes) will persist to MongoDB.

