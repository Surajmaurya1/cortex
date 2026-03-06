const fs = require('fs/promises');
const path = require('path');
const { scanDirectory } = require('./scanner');
const { chunkText } = require('./chunker');
const { embedChunks } = require('./embedder');
const { upsertDocuments } = require('../vector-db/chroma-client');

let indexingStatus = {
  isIndexing: false,
  totalFiles: 0,
  processedFiles: 0,
  currentFile: ''
};

async function indexProject(projectPath) {
  if (indexingStatus.isIndexing) {
    throw new Error('Indexing already in progress');
  }

  indexingStatus = {
    isIndexing: true,
    totalFiles: 0,
    processedFiles: 0,
    currentFile: ''
  };

  try {
    const files = await scanDirectory(projectPath);
    indexingStatus.totalFiles = files.length;

    // Use project path as the collection name (sanitized)
    const collectionName = path.basename(projectPath).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'default_project';

    for (const file of files) {
      indexingStatus.currentFile = file;
      
      const content = await fs.readFile(file, 'utf-8');
      const chunks = chunkText(content);
      
      if (chunks.length > 0) {
        const embeddedChunks = await embedChunks(chunks);
        
        const documents = embeddedChunks.map((chunk, index) => ({
          id: `${file}_chunk_${index}`,
          embedding: chunk.embedding,
          text: chunk.text,
          metadata: {
            filePath: file,
            startLine: chunk.startLine,
            endLine: chunk.endLine
          }
        }));

        if (documents.length > 0) {
           await upsertDocuments(collectionName, documents);
        }
      }
      
      indexingStatus.processedFiles++;
    }
  } catch (error) {
    console.error('Indexing failed:', error);
    throw error;
  } finally {
    indexingStatus.isIndexing = false;
  }
}

function getIndexingStatus() {
  return indexingStatus;
}

module.exports = {
  indexProject,
  getIndexingStatus
};
