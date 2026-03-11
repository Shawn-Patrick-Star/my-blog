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
        <div className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-xs px-4 py-2 rounded-full max-w-[80%] text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar Placeholder */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${isUser ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1">
          <div
            className={`px-4 py-3 rounded-2xl relative group ${
              isUser
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-sm shadow-sm'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            
            {/* Speaker Analysis Button (🔍) */}
            {!isUser && message.content && (
              <button
                onClick={() => onAnalyzeClick?.(message.id)}
                className={`absolute -right-10 bottom-1 p-1.5 rounded-full transition-all ${
                  isActiveAnalysis 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-gray-300 dark:text-zinc-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 opacity-0 group-hover:opacity-100'
                }`}
                title="Analyze this sentence"
              >
                {message.isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {message.monitorAnalysis && !isActiveAnalysis && !message.isAnalyzing && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-zinc-950"></span>
                )}
              </button>
            )}

            {/* User Correction Button (✅/❌) */}
            {isUser && message.content && (
              <button
                onClick={() => onCorrectionClick?.(message.id)}
                className={`absolute -left-10 bottom-1 p-1.5 rounded-full transition-all ${
                  isActiveAnalysis 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-gray-300 dark:text-zinc-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100'
                }`}
                title="View corrections"
              >
                {message.isCorrecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : message.userCorrection ? (
                  message.userCorrection.has_error ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )
                ) : null}
              </button>
            )}
          </div>
          
          {/* Timestamp */}
          <span className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default ChatMessage;
