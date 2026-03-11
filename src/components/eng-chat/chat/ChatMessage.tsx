"use client";

import React from 'react';
import { Message } from '@/lib/eng-chat/types';
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
  onAnalyzeClick?: (messageId: string) => void;
  onCorrectionClick?: (messageId: string) => void;
  isActiveAnalysis?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onAnalyzeClick,
  onCorrectionClick,
  isActiveAnalysis,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted text-muted-foreground text-xs px-4 py-2 rounded-full max-w-[80%] text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[95%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        
        {/* Avatar Placeholder */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-primary-foreground text-xs font-bold ${isUser ? 'bg-primary' : 'bg-emerald-500'}`}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1">
          <div
            className={`px-4 py-3 rounded-2xl relative group ${
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            
            {/* Speaker Analysis Button (🔍) */}
            {!isUser && message.content && (
              <button
                onClick={() => onAnalyzeClick?.(message.id)}
                className={`absolute -right-10 bottom-1 p-1.5 rounded-full transition-all ${
                  isActiveAnalysis 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-muted-foreground/30 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100'
                }`}
                title="分析此句子"
              >
                {message.isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {message.monitorAnalysis && !isActiveAnalysis && !message.isAnalyzing && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-background"></span>
                )}
              </button>
            )}

            {/* User Correction Button (✅/❌) */}
            {isUser && message.content && (
              <button
                onClick={() => onCorrectionClick?.(message.id)}
                className={`absolute -left-10 bottom-1 p-1.5 rounded-full transition-all ${
                  isActiveAnalysis 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-muted-foreground/30 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100'
                }`}
                title="查看纠错"
              >
                {message.isCorrecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : message.userCorrection ? (
                  message.userCorrection.has_error ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )
                ) : null}
              </button>
            )}
          </div>
          
          {/* Timestamp */}
          <span className={`text-[10px] text-muted-foreground px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default ChatMessage;
