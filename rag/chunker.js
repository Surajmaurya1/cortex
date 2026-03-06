function chunkText(text, maxTokens = 400, overlapTokens = 50) {
  // A simple approximation: 1 token ~ 4 characters
  const maxChars = maxTokens * 4;
  const overlapChars = overlapTokens * 4;
  
  const chunks = [];
  const lines = text.split('\n');
  
  let currentChunk = '';
  let currentStartLine = 1;
  let currentLineIndex = 0;

  while (currentLineIndex < lines.length) {
    const line = lines[currentLineIndex];
    
    if ((currentChunk.length + line.length) > maxChars && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startLine: currentStartLine,
        endLine: currentLineIndex
      });
      
      // Backtrack for overlap
      // Find how many lines to backtrack to cover overlapChars
      let backtrackLength = 0;
      let backtrackIndex = currentLineIndex - 1;
      while (backtrackIndex >= currentStartLine && backtrackLength < overlapChars) {
        backtrackLength += lines[backtrackIndex].length + 1;
        backtrackIndex--;
      }
      
      currentStartLine = backtrackIndex + 1;
      currentLineIndex = currentStartLine;
      currentChunk = '';
    } else {
      currentChunk += line + '\n';
      currentLineIndex++;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      startLine: currentStartLine,
      endLine: currentLineIndex
    });
  }

  return chunks;
}

module.exports = {
  chunkText
};
