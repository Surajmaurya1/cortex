const express = require('express');
const { getGitInstance } = require('../../git/simple-git-wrapper');

const router = express.Router();

router.post('/init', async (req, res) => {
  const { cwd } = req.body;
  try {
    const result = await getGitInstance(cwd).init();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', async (req, res) => {
  const { cwd } = req.query;
  try {
    const status = await getGitInstance(cwd).status();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/branches', async (req, res) => {
  const { cwd } = req.query;
  try {
    const branches = await getGitInstance(cwd).branch();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkout', async (req, res) => {
  const { cwd, branch } = req.body;
  try {
    const result = await getGitInstance(cwd).checkout(branch);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { cwd, files } = req.body; // files can be string '.' or array of files
  try {
    const result = await getGitInstance(cwd).add(files);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/commit', async (req, res) => {
  const { cwd, message } = req.body;
  try {
    const result = await getGitInstance(cwd).commit(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/push', async (req, res) => {
  const { cwd } = req.body;
  try {
    const result = await getGitInstance(cwd).push();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/log', async (req, res) => {
  const { cwd, maxCount = 10 } = req.query;
  try {
    const log = await getGitInstance(cwd).log(['-n', maxCount]);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
