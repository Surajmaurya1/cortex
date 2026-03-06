const express = require('express');
const router = express.Router();
// We'll require the rag library modules later once we create them
const { indexProject, getIndexingStatus } = require('../../rag/indexer');
const { searchProject } = require('../../rag/retriever');

router.post('/index', async (req, res) => {
  const { projectPath } = req.body;
  if (!projectPath) {
    return res.status(400).json({ error: 'projectPath is required' });
  }

  try {
    // Fire and forget indexing to not block request
    indexProject(projectPath).catch(err => console.error('Indexing failed:', err));
    res.json({ message: 'Indexing started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', (req, res) => {
  const status = getIndexingStatus();
  res.json(status);
});

router.post('/search', async (req, res) => {
  const { query, projectPath, topK = 5 } = req.body;
  
  if (!query || !projectPath) {
    return res.status(400).json({ error: 'query and projectPath are required' });
  }

  try {
    const results = await searchProject(query, projectPath, topK);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
