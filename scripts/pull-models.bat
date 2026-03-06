@echo off
echo Pulling deepseek-coder...
ollama pull deepseek-coder:6.7b

echo.
echo Pulling qwen2.5-coder...
ollama pull qwen2.5-coder:7b

echo.
echo Pulling embedding model (nomic-embed-text)...
ollama pull nomic-embed-text

echo.
echo All models successfully pulled.
pause
