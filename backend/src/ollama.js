const { spawn } = require('child_process');

class OllamaClient {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.defaultModel = 'qwen2.5-coder:7b';
    this.embeddingModel = 'nomic-embed-text';
  }

  async setModel(modelName) {
    this.defaultModel = modelName;
  }

  async generateChatResponse(messages, model = this.defaultModel) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  async streamChatResponse(messages, onChunk, model = this.defaultModel) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!response.body) throw new Error('ReadableStream not supported');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            onChunk(parsed.message.content);
          }
        } catch (e) {
          console.error("Error parsing Ollama chunk:", e, line);
        }
      }
    }
  }

  async generateEmbeddings(prompt, model = this.embeddingModel) {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Embedding Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }
}

const client = new OllamaClient();

module.exports = {
  generateChatResponse: client.generateChatResponse.bind(client),
  streamChatResponse: client.streamChatResponse.bind(client),
  generateEmbeddings: client.generateEmbeddings.bind(client),
};
