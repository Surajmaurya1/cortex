const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();

const IGNORED_DIRS = new Set(['node_modules', '.git', 'build', 'dist', '.next', 'out']);

async function getDirectoryTree(dirPath) {
  const stats = await fs.stat(dirPath);
  if (!stats.isDirectory()) {
    throw new Error('Not a directory');
  }

  const name = path.basename(dirPath);
  if (IGNORED_DIRS.has(name)) return null;

  const node = {
    name,
    path: dirPath,
    type: 'directory',
    children: []
  };

  const entities = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entity of entities) {
    const fullPath = path.join(dirPath, entity.name);
    if (entity.isDirectory()) {
      if (!IGNORED_DIRS.has(entity.name)) {
        node.children.push(await getDirectoryTree(fullPath));
      }
    } else {
      node.children.push({
        name: entity.name,
        path: fullPath,
        type: 'file'
      });
    }
  }
  
  // Sort: directories first, then alphabetical
  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return node;
}

router.get('/tree', async (req, res) => {
  const { dirPath } = req.query;
  if (!dirPath) return res.status(400).json({ error: 'dirPath required' });

  try {
    const tree = await getDirectoryTree(dirPath);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/file', async (req, res) => {
  const { filePath } = req.query;
  if (!filePath) return res.status(400).json({ error: 'filePath required' });

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/file', async (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'filePath and content required' });
  }

  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
