# Backend Assignments — Jobs & Expense Tracker

Simple Express API implementing the requested endpoints for the two assignments.

Quick start

1. Install dependencies

```bash
npm install
```

2. Run

```bash
npm start
# or during development
npm run dev
```

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

Examples

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

Notes

- This uses simple JSON-file storage in `data/`. For production, replace with a proper DB.
- `data/` is ignored in `.gitignore` to avoid committing personal data. If you want the instructors to access your work, either commit the data or provide example screenshots and open the repo publicly.
