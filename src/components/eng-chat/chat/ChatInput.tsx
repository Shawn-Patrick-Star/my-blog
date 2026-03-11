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
    <div className="flex flex-col w-full bg-background/80 backdrop-blur-md border-t border-border p-4 shrink-0 relative z-20">
      {/* Hints Panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-card rounded-2xl shadow-lg border border-primary/20 p-4 z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                推荐回复
              </h4>
              <button 
                onClick={() => setShowHints(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                关闭
              </button>
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-4 text-primary gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                监控正在生成分析提示...
              </div>
            ) : hints.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {hints.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHintClick(hint.suggested_sentence)}
                    className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">
                      {hint.direction}
                    </div>
                    <div className="text-sm text-foreground group-hover:text-primary transition-colors">
                      "{hint.suggested_sentence}"
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {hint.key_words.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-primary border border-primary/10">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                当前回合暂无推荐。
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
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
          }`}
          title="需要提示吗？"
        >
          <Lightbulb className="w-5 h-5" />
          {hints.length > 0 && !showHints && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          )}
        </button>

        {/* Textarea */}
        <div className="flex-1 relative bg-muted rounded-2xl border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "AI 正在思考..." : "用英文回复..."}
            className="w-full bg-transparent py-3 px-4 outline-none resize-none min-h-[48px] max-h-[120px] text-foreground placeholder-muted-foreground/50 custom-scrollbar"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || disabled}
          className={`p-3 rounded-xl shrink-0 transition-all ${
            text.trim() && !disabled
              ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
              : 'bg-muted text-muted-foreground/30'
          }`}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="text-center mt-2 text-[10px] text-muted-foreground">
        Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

export default ChatInput;
