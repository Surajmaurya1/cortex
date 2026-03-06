#!/bin/bash
# Start ChromaDB local server

echo "Checking for chromadb..."
if ! python3 -c "import chromadb" &> /dev/null; then
    echo "Installing chromadb via pip..."
    pip install chromadb
fi

echo "Starting ChromaDB on port 8000..."
chroma run --port 8000
