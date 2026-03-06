const express = require('express');
const { generateChatResponse, streamChatResponse } = require('../ollama');
const { buildContext } = require('../../context-builder');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { messages, contextData, stream = true } = req.body;
  // contextData should include: { selectedCode, file, cursor, nearbyLines, ragChunks, projectTree }
  
  try {
    const injectedContext = await buildContext(contextData);
    
    // Inject context into the last user message
    const lastMessage = messages[messages.length - 1];
    const originalContent = lastMessage.content;
    
    lastMessage.content = `
Context Information:
${injectedContext}

---
User Request:
${originalContent}
`;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      await streamChatResponse(messages, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await generateChatResponse(messages);
      res.json({ response });
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/inline-edit', async (req, res) => {
  const { codeBlock, fileContext, command } = req.body;
  
  const systemPrompt = `You are Cortex IDE, an expert AI pair programmer.
The user has selected a block of code and requested an edit: "${command}"
You must output ONLY the updated code block that completely replaces the user's selection.
Do not wrap it in markdown blockticks if the user didn't have them.
Do not provide any explanations, just the raw code replacement.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Context (${fileContext}):\n\nSelection:\n${codeBlock}\n\nCommand: ${command}` }
  ];
  
  try {
    const response = await generateChatResponse(messages);
    res.json({ newCode: response.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/commit-message', async (req, res) => {
  const { diff } = req.body;
  
  const prompt = `You are a strict, professional senior software engineer. Analyze the following Git diff and generate a concise conventional commit message.
Format: <type>(<scope>): <subject>
Do not explain. Just output the message.

Diff:
${diff}`;

  try {
    const response = await generateChatResponse([{ role: 'user', content: prompt }]);
    res.json({ message: response.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/code-review', async (req, res) => {
  const { diff } = req.body;
  const prompt = `You are a senior code reviewer. Review the following diff and briefly suggest improvements, point out bugs, or mention good practices. Keep it concise.
  
Diff:
${diff}`;
  try {
    const response = await generateChatResponse([{ role: 'user', content: prompt }]);
    res.json({ review: response.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
