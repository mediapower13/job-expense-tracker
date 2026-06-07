const express = require('express');

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
  // Body-parser throws SyntaxError for malformed JSON payloads.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
