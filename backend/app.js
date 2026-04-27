const express = require('express');
const cors    = require('cors');

const routes      = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// ── Global Middlewares ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

module.exports = app;