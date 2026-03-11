import { AppSettings, MonitorAnalysis, UserCorrection } from '../types';
import { getMonitorSpeakerPrompt, getMonitorUserPrompt } from './prompts';

export const analyzeSpeakerMessage = async (
  speakerText: string,
  settings: AppSettings
): Promise<MonitorAnalysis | null> => {
  try {
    const response = await fetch('/api/eng-chat/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: getMonitorSpeakerPrompt(settings.userLevel) },
          { role: 'user', content: `Analyze the following sentence spoken by an AI conversational partner to an English learner:\n\n"${speakerText}"\n\nRespond with JSON.` }
        ],
        settings,
      }),
    });

    if (response.ok) {
      return await response.json() as MonitorAnalysis;
    }
    return null;
  } catch (error) {
    console.error('Error analyzing speaker message via proxy:', error);
    return null;
  }
};

export const analyzeUserMessage = async (
  userText: string,
  previousSpeakerText: string | null,
  settings: AppSettings
): Promise<UserCorrection | null> => {
  try {
    let prompt = `Analyze the following sentence spoken by an English learner:\n\nUser: "${userText}"\n\nRespond with JSON.`;
    if (previousSpeakerText) {
      prompt = `Context (Speaker's previous sentence): "${previousSpeakerText}"\n\n` + prompt;
    }

    const response = await fetch('/api/eng-chat/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: getMonitorUserPrompt() },
          { role: 'user', content: prompt }
        ],
        settings,
      }),
    });

    if (response.ok) {
      return await response.json() as UserCorrection;
    }
    return null;
  } catch (error) {
    console.error('Error analyzing user message via proxy:', error);
    return null;
  }
};
