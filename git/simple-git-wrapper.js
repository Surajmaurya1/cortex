const simpleGit = require('simple-git');

// Store git instances per cwd to avoid re-initializing
const gitInstances = new Map();

function getGitInstance(cwd = process.cwd()) {
  if (!gitInstances.has(cwd)) {
    const git = simpleGit(cwd);
    gitInstances.set(cwd, git);
  }
  return gitInstances.get(cwd);
}

module.exports = {
  getGitInstance
};
