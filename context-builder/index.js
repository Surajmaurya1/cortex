/**
 * Assembles the context string to be injected into the AI prompt.
 * 
 * @param {Object} data Context pieces provided by the frontend and RAG system
 * @param {string} data.selectedCode - Currently selected code snippet
 * @param {string} data.file - Current file path
 * @param {string} data.cursor - Cursor position info
 * @param {string} data.nearbyLines - Surrounding ±50 lines text
 * @param {Array}  data.ragChunks - Top-K search results from ChromaDB
 * @param {string} data.projectTree - Formatted project directory tree
 * @returns {string} Formatted context block
 */
async function buildContext(data) {
  let contextParts = [];

  if (data.projectTree) {
    contextParts.push(`[Project Structure]\n${data.projectTree}`);
  }

  if (data.file) {
    contextParts.push(`[Current File]\nPath: ${data.file}`);
  }

  if (data.cursor) {
    contextParts.push(`[Cursor Position]\n${data.cursor}`);
  }

  if (data.nearbyLines) {
    contextParts.push(`[Nearby Code Context]\n${data.nearbyLines}`);
  }

  if (data.selectedCode) {
    contextParts.push(`[Selected Code]\n${data.selectedCode}`);
  }

  if (data.ragChunks && data.ragChunks.length > 0) {
    const chunkText = data.ragChunks.map((chunk, i) => {
      const file = chunk.metadata.filePath;
      const start = chunk.metadata.startLine;
      const end = chunk.metadata.endLine;
      return `--- RAG Snippet ${i + 1} (${file} lines ${start}-${end}) ---\n${chunk.text}`;
    }).join('\n\n');

    contextParts.push(`[Related Code from Project]\n${chunkText}`);
  }

  return contextParts.join('\n\n');
}

module.exports = {
  buildContext
};
