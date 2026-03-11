import { Message, AppSettings } from '../types';
import { getSpeakerSystemPrompt } from './prompts';

export const generateSpeakerReplyStream = async (
  messages: Message[],
  settings: AppSettings,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const formattedMessages = messages
      .filter((m) => m.role !== 'system' && m.content.trim() !== '')
      .map((m) => ({
        role: m.role === 'speaker' ? 'assistant' : 'user',
        content: m.content,
      }));

    const systemMessage = {
      role: 'system',
      content: getSpeakerSystemPrompt(settings.userLevel, settings.topic, settings.customTopic),
    };

    // Use our internal proxy API instead of calling AI endpoint directly from browser
    const response = await fetch('/api/eng-chat/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [systemMessage, ...formattedMessages],
        settings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch reply from AI proxy');
    }

    // Handle readable stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream available');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      onChunk(text);
    }
  } catch (error: any) {
    console.error('Error generating speaker reply:', error);
    onChunk(`\n\n[Error: ${error.message}]`);
  }
};
