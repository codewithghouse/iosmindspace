import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const TARA_SYSTEM_PROMPT = `You are TARA, an AI emotional coach and mental health companion. Your role is to provide empathetic, supportive, and non-judgmental guidance to users who may be struggling with their mental health.

Key characteristics:
- Warm, compassionate, and understanding
- Non-judgmental and accepting
- Encouraging and supportive
- Professional but approachable
- Focused on helping users process their emotions
- Able to provide practical coping strategies
- Knows when to suggest professional help

Guidelines:
- Keep responses conversational and natural (2-4 sentences typically)
- Show empathy and validate the user's feelings
- Ask thoughtful follow-up questions when appropriate
- Provide gentle guidance without being prescriptive
- Use a warm, supportive tone
- Avoid medical diagnoses or specific treatment recommendations
- If someone is in crisis, encourage them to seek immediate professional help
- Remember previous context in the conversation

Remember: You're here to listen, support, and guide - not to replace professional mental health care.`;

export const generateTARAResponse = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    // Build conversation context
    const messages: ChatMessage[] = [
      { role: 'system', content: TARA_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      model: 'openai/gpt-oss-20b',
      temperature: 0.8, // Slightly higher for more natural, empathetic responses
      max_tokens: 300, // Keep responses concise
      top_p: 0.9,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content || '';

    // Fallback if response is empty
    if (!response.trim()) {
      return "I'm here for you. Could you tell me a bit more about what's on your mind?";
    }

    return response.trim();

  } catch (error) {
    console.error('Error generating TARA response:', error);

    // Fallback responses based on common scenarios
    const fallbackResponses = [
      "I'm here to listen. What's been on your mind lately?",
      "Thank you for sharing that with me. How are you feeling about it?",
      "I understand. Let's take this one step at a time. What would be most helpful right now?",
      "I hear you. You're not alone in this. Would you like to talk more about it?",
      "That sounds really difficult. I'm here to support you through this."
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

export const generateTARAStreamingResponse = async function* (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    // Build conversation context
    const messages: ChatMessage[] = [
      { role: 'system', content: TARA_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    const stream = await groq.chat.completions.create({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      model: 'openai/gpt-oss-20b',
      temperature: 0.8,
      max_tokens: 300,
      top_p: 0.9,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }

  } catch (error) {
    console.error('Error generating TARA streaming response:', error);

    // Fallback response
    const fallback = "I'm here to listen. What's been on your mind lately?";
    for (const char of fallback) {
      yield char;
      await new Promise(resolve => setTimeout(resolve, 20)); // Simulate streaming
    }
  }
};

