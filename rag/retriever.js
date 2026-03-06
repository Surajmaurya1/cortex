const path = require('path');
const { generateEmbeddings } = require('../backend/src/ollama');
const { queryCollection } = require('../vector-db/chroma-client');

async function searchProject(query, projectPath, topK = 5) {
  try {
    const queryEmbedding = await generateEmbeddings(query);
    const collectionName = path.basename(projectPath).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'default_project';
    
    const results = await queryCollection(collectionName, queryEmbedding, topK);
    
    // Format ChromaDB results
    if (results && results.ids && results.ids[0]) {
      const formattedResults = results.ids[0].map((id, index) => ({
        id,
        text: results.documents[0][index],
        metadata: results.metadatas[0][index],
        distance: results.distances ? results.distances[0][index] : null
      }));
      return formattedResults;
    }
    
    return [];
  } catch (err) {
    console.error('Semantic search failed:', err);
    throw err;
  }
}

module.exports = {
  searchProject
};
