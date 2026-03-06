const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Import routes
const aiRoutes = require('./routes/ai');
const ragRoutes = require('./routes/rag');
const gitRoutes = require('./routes/git');
const fsRoutes = require('./routes/fs');

// Register routes
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/fs', fsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Cortex Backend] Server running on http://localhost:${PORT}`);
});
