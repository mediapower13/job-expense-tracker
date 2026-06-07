
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

