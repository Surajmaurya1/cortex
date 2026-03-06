const fs = require('fs/promises');
const path = require('path');

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'build', 'dist', '.next', 'out', '.vscode', '.idea'
]);

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.webm', '.pdf', '.zip', '.tar', '.gz', '.dll', '.exe', '.bin'
]);

async function scanDirectory(dirPath) {
  let fileList = [];

  const walk = async (currentPath) => {
    const stats = await fs.stat(currentPath);
    
    if (stats.isDirectory()) {
      const name = path.basename(currentPath);
      if (IGNORED_DIRS.has(name) || name.startsWith('.')) return;

      const entities = await fs.readdir(currentPath);
      for (const entity of entities) {
        await walk(path.join(currentPath, entity));
      }
    } else if (stats.isFile()) {
      const ext = path.extname(currentPath).toLowerCase();
      if (!IGNORED_EXTENSIONS.has(ext)) {
        fileList.push(currentPath);
      }
    }
  };

  await walk(dirPath);
  return fileList;
}

module.exports = {
  scanDirectory
};
