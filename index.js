const express = require('express');
const path = require('path');

const jobsRouter = require('./routes/jobs');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/jobs', jobsRouter);
app.use('/transactions', transactionsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Backend assignments API. See /jobs and /transactions' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
