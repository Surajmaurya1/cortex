#!/bin/bash
# Pull required models for Cortex IDE

echo "Pulling deepseek-coder..."
ollama pull deepseek-coder:6.7b

echo "Pulling qwen2.5-coder..."
ollama pull qwen2.5-coder:7b

echo "Pulling embedding model (nomic-embed-text)..."
ollama pull nomic-embed-text

echo "All models successfully pulled."
