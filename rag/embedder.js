const { generateEmbeddings } = require('../backend/src/ollama');

async function embedChunks(chunks) {
  // Process sequentially to not overload Ollama
  const embeddedChunks = [];
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbeddings(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding
      });
    } catch (error) {
      console.error('Failed to embed chunk:', error);
    }
  }
  return embeddedChunks;
}

module.exports = {
  embedChunks
};
