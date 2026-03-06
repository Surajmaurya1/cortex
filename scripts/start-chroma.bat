@echo off
echo Checking for chromadb...
python -c "import chromadb" >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing chromadb via pip...
    pip install chromadb
)

echo Starting ChromaDB on port 8000...
chroma run --port 8000
pause
