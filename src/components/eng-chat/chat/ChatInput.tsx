"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, Loader2 } from 'lucide-react';
import { useChatStore } from '@/lib/eng-chat/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [showHints, setShowHints] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages } = useChatStore();
  
  // Find the last speaker message to get hints
  const lastSpeakerMessage = [...messages].reverse().find(m => m.role === 'speaker');
  const hints = lastSpeakerMessage?.monitorAnalysis?.hints || [];
  const isAnalyzing = lastSpeakerMessage?.isAnalyzing;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      setShowHints(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleHintClick = (suggestedSentence: string) => {
    setText(suggestedSentence);
    setShowHints(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 p-4 shrink-0 relative z-20">
      {/* Hints Panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-900 p-4 z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                Suggested Replies
              </h4>
              <button 
                onClick={() => setShowHints(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Close
              </button>
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-4 text-emerald-600 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Monitor is thinking...
              </div>
            ) : hints.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {hints.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHintClick(hint.suggested_sentence)}
                    className="w-full text-left p-3 rounded-xl border border-emerald-50 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 transition-all group"
                  >
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
                      {hint.direction}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-zinc-200 group-hover:text-emerald-900 dark:group-hover:text-emerald-300">
                      "{hint.suggested_sentence}"
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {hint.key_words.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white dark:bg-zinc-800 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No hints available for this turn.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full relative">
        {/* Hint Toggle Button */}
        <button
          onClick={() => setShowHints(!showHints)}
          className={`p-3 rounded-xl transition-colors shrink-0 ${
            showHints 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
              : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
          }`}
          title="Need Help?"
        >
          <Lightbulb className="w-5 h-5" />
          {hints.length > 0 && !showHints && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-zinc-950"></span>
          )}
        </button>

        {/* Textarea */}
        <div className="flex-1 relative bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "Speaker is typing..." : "Type your reply in English..."}
            className="w-full bg-transparent py-3 px-4 outline-none resize-none min-h-[48px] max-h-[120px] text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 custom-scrollbar"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || disabled}
          className={`p-3 rounded-xl shrink-0 transition-all ${
            text.trim() && !disabled
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="text-center mt-2 text-[10px] text-gray-400">
        Press Enter to send, Shift + Enter for new line.
      </div>
    </div>
  );
};

export default ChatInput;
