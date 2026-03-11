"use client";

import React from 'react';
import { MonitorAnalysis } from '@/lib/eng-chat/types';
import { BookOpen, GraduationCap } from 'lucide-react';

interface VocabCardProps {
  analysis: MonitorAnalysis;
}

const VocabCard: React.FC<VocabCardProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      {/* Vocabulary Section */}
      {analysis.vocabulary && analysis.vocabulary.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Key Vocabulary
          </h3>
          <div className="space-y-3">
            {analysis.vocabulary.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-gray-50 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-gray-900 dark:text-zinc-100">{item.word}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded uppercase tracking-wider">
                    {item.partOfSpeech}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Point Section */}
      {analysis.grammar_point && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
          <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            Grammar Point
          </h3>
          <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
            {analysis.grammar_point}
          </p>
        </div>
      )}
    </div>
  );
};

export default VocabCard;
