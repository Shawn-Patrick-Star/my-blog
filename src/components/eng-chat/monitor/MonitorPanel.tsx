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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Monitor
        </h2>
        {activeAnalysisId && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Close Panel"
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
              className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-400 dark:text-zinc-600"
            >
              <Activity className="w-12 h-12 text-gray-200 dark:text-zinc-800" />
              <p className="text-sm max-w-[200px]">
                Click the 🔍 or ✅/❌ icon next to a message to view its analysis.
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
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 text-sm p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 italic">
                "{activeMessage.content}"
              </div>

              {activeMessage.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">Analyzing sentence structure...</span>
                </div>
              ) : activeMessage.monitorAnalysis ? (
                <VocabCard analysis={activeMessage.monitorAnalysis} />
              ) : (
                <div className="text-center text-gray-500 dark:text-zinc-500 text-sm py-8">
                  Analysis failed or not available.
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
              <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400 text-sm p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 italic">
                "{activeMessage.content}"
              </div>

              {activeMessage.isCorrecting ? (
                <div className="flex flex-col items-center justify-center py-12 text-indigo-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">Checking grammar and phrasing...</span>
                </div>
              ) : activeMessage.userCorrection ? (
                <CorrectionCard correction={activeMessage.userCorrection} />
              ) : (
                <div className="text-center text-gray-500 dark:text-zinc-500 text-sm py-8">
                  Correction failed or not available.
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
