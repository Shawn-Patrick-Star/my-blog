import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, MonitorAnalysis, UserCorrection } from '../types';
import { generateSpeakerReplyStream } from '../ai/speaker';
import { analyzeSpeakerMessage, analyzeUserMessage } from '../ai/monitor';
import { useSettingsStore } from './useSettingsStore';
import { generateId, isChinese } from '../helpers';

interface ChatState {
  messages: Message[];
  isSpeakerTyping: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  updateMessageContent: (id: string, content: string) => void;
  setSpeakerTyping: (isTyping: boolean) => void;
  
  // Monitor Actions
  setAnalyzing: (id: string, isAnalyzing: boolean) => void;
  setMonitorAnalysis: (id: string, analysis: MonitorAnalysis) => void;
  
  setCorrecting: (id: string, isCorrecting: boolean) => void;
  setUserCorrection: (id: string, correction: UserCorrection) => void;
  
  clearChat: () => void;

  // Core Workflow
  sendMessage: (text: string) => Promise<void>;
  triggerSpeakerReply: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isSpeakerTyping: false,

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateMessageContent: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        })),

      setSpeakerTyping: (isTyping) => set({ isSpeakerTyping: isTyping }),

      setAnalyzing: (id, isAnalyzing) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, isAnalyzing } : msg
          ),
        })),

      setMonitorAnalysis: (id, analysis) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, monitorAnalysis: analysis, isAnalyzing: false } : msg
          ),
        })),

      setCorrecting: (id, isCorrecting) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, isCorrecting } : msg
          ),
        })),

      setUserCorrection: (id, correction) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, userCorrection: correction, isCorrecting: false } : msg
          ),
        })),

      clearChat: () => set({ messages: [] }),

      sendMessage: async (text: string) => {
        if (!text.trim()) return;

        // Check if it's Chinese (Edge case handling)
        if (isChinese(text)) {
          // For now, we'll just add a system message. Later we can implement the translation feature.
          const sysMsg: Message = {
            id: generateId(),
            role: 'system',
            content: "It looks like you typed in Chinese. Try to express yourself in English! If you need help, check the hints.",
            timestamp: Date.now(),
          };
          get().addMessage(sysMsg);
          return;
        }

        const userMsgId = generateId();
        const userMsg: Message = {
          id: userMsgId,
          role: 'user',
          content: text,
          timestamp: Date.now(),
          isCorrecting: true,
        };

        get().addMessage(userMsg);
        get().setSpeakerTyping(true);

        const settings = useSettingsStore.getState().settings;

        // Find previous speaker message for context
        const messages = get().messages;
        const previousSpeakerMsg = [...messages].reverse().find(m => m.role === 'speaker');
        const previousSpeakerText = previousSpeakerMsg ? previousSpeakerMsg.content : null;

        // Async Monitor User Analysis (Step 5)
        analyzeUserMessage(text, previousSpeakerText, settings).then((correction) => {
          if (correction) {
            get().setUserCorrection(userMsgId, correction);
          } else {
            get().setCorrecting(userMsgId, false);
          }
        });

        // Trigger Speaker Reply (Step 6 -> Step 1)
        await get().triggerSpeakerReply();
      },

      triggerSpeakerReply: async () => {
        const speakerMsgId = generateId();
        const speakerMsg: Message = {
          id: speakerMsgId,
          role: 'speaker',
          content: '',
          timestamp: Date.now(),
          isAnalyzing: true,
        };

        get().addMessage(speakerMsg);
        
        const settings = useSettingsStore.getState().settings;
        const messages = get().messages;

        let fullReply = '';
        await generateSpeakerReplyStream(messages, settings, (chunk) => {
          fullReply += chunk;
          get().updateMessageContent(speakerMsgId, fullReply);
        });

        get().setSpeakerTyping(false);

        // Async Monitor Speaker Analysis (Step 2)
        analyzeSpeakerMessage(fullReply, settings).then((analysis) => {
          if (analysis) {
            get().setMonitorAnalysis(speakerMsgId, analysis);
          } else {
            get().setAnalyzing(speakerMsgId, false);
          }
        });
      },
    }),
    {
      name: 'english-tutor-chat-history',
    }
  )
);
