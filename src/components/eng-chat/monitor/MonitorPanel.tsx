"use client";

import React from 'react';
import { useChatStore } from '@/lib/eng-chat/store/useChatStore';
import VocabCard from './VocabCard';
import CorrectionCard from './CorrectionCard';
import { X, Loader2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonitorPanelProps {
  activeAnalysisId: string | null;
  onClose: () => void;
}

const MonitorPanel: React.FC<MonitorPanelProps> = ({ activeAnalysisId, onClose }) => {
  const { messages } = useChatStore();

  const activeMessage = messages.find((m) => m.id === activeAnalysisId);

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shrink-0">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          智能监控
        </h2>
        {activeAnalysisId && (
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="关闭面板"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!activeMessage ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground"
            >
              <Activity className="w-12 h-12 opacity-10" />
              <p className="text-sm max-w-[200px]">
                点击消息旁的 🔍 或 ✅/❌ 图标来查看深度分析建议。
              </p>
            </motion.div>
          ) : activeMessage.role === 'speaker' ? (
            <motion.div
              key="speaker-analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 text-primary text-sm p-4 rounded-2xl border border-primary/20 italic">
                "{activeMessage.content}"
              </div>

              {activeMessage.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-primary gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">正在分析句子结构...</span>
                </div>
              ) : activeMessage.monitorAnalysis ? (
                <VocabCard analysis={activeMessage.monitorAnalysis} />
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  未能获取分析。
                </div>
              )}
            </motion.div>
          ) : activeMessage.role === 'user' ? (
            <motion.div
              key="user-correction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 text-primary text-sm p-4 rounded-2xl border border-primary/20 italic">
                "{activeMessage.content}"
              </div>

              {activeMessage.isCorrecting ? (
                <div className="flex flex-col items-center justify-center py-12 text-primary gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">正在检查语法和习惯表达...</span>
                </div>
              ) : activeMessage.userCorrection ? (
                <CorrectionCard correction={activeMessage.userCorrection} />
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  未能获取纠错建议。
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MonitorPanel;
