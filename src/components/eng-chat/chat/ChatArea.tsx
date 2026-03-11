"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/eng-chat/store/useChatStore';
import ChatMessage from './ChatMessage';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import SettingsModal from '../settings/SettingsModal';
import { MessageSquare } from 'lucide-react';

interface ChatAreaProps {
  onAnalyzeClick: (messageId: string) => void;
  onCorrectionClick: (messageId: string) => void;
  activeAnalysisId: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  onAnalyzeClick,
  onCorrectionClick,
  activeAnalysisId,
}) => {
  const { messages, isSpeakerTyping, sendMessage, triggerSpeakerReply } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize hasStarted based on messages
  useEffect(() => {
    if (messages.length > 0) {
      setHasStarted(true);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeakerTyping]);

  const handleStartConversation = () => {
    setHasStarted(true);
    triggerSpeakerReply();
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      {/* Header Area */}
      {hasStarted && <ChatHeader onOpenSettings={() => setIsSettingsOpen(true)} />}
      
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto w-full flex flex-col justify-end min-h-full">
          {!hasStarted && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 my-auto py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 font-fredoka">准备好练习了吗？</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  AI 老师将根据你选定的等级和场景开启对话。
                </p>
              </div>
              <button
                onClick={handleStartConversation}
                className="px-8 py-3 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                开始对话
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onAnalyzeClick={onAnalyzeClick}
                  onCorrectionClick={onCorrectionClick}
                  isActiveAnalysis={activeAnalysisId === msg.id}
                />
              ))}
              
              {/* Typing Indicator: Only show if speaker is typing but message has NOT appeared yet in the list with content */}
              {isSpeakerTyping && messages[messages.length - 1]?.role !== 'speaker' && (
                <div className="flex justify-start mb-6">
                  <div className="flex items-start gap-2 max-w-[95%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                      AI
                    </div>
                    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      {hasStarted && (
        <ChatInput
          onSend={sendMessage}
          disabled={isSpeakerTyping}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatArea;
