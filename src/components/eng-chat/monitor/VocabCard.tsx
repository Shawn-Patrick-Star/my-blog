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
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" />
            重点词汇
          </h3>
          <div className="space-y-3">
            {analysis.vocabulary.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-border/50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-foreground">{item.word}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-wider">
                    {item.partOfSpeech}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground mt-1">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Point Section */}
      {analysis.grammar_point && (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4" />
            语法解析
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {analysis.grammar_point}
          </p>
        </div>
      )}
    </div>
  );
};

export default VocabCard;
