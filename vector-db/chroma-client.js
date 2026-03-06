const { ChromaClient } = require('chromadb');

const client = new ChromaClient({
  path: 'http://localhost:8000'
});

async function getOrCreateCollection(name) {
  try {
    return await client.getOrCreateCollection({
      name,
      metadata: { "hnsw:space": "cosine" }
    });
  } catch (err) {
    console.error(`Failed to get/create collection ${name}`, err);
    throw err;
  }
}

async function upsertDocuments(collectionName, documents) {
  const collection = await getOrCreateCollection(collectionName);
  
  const ids = documents.map(doc => doc.id);
  const embeddings = documents.map(doc => doc.embedding);
  const metadatas = documents.map(doc => doc.metadata);
  const texts = documents.map(doc => doc.text);

  await collection.upsert({
    ids,
    embeddings,
    metadatas,
    documents: texts
  });
}

async function queryCollection(collectionName, queryEmbedding, nResults = 5) {
  const collection = await getOrCreateCollection(collectionName);
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults
  });

  return results;
}

module.exports = {
  getOrCreateCollection,
  upsertDocuments,
  queryCollection
};
