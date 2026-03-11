"use client";

import React from 'react';
import { UserCorrection } from '@/lib/eng-chat/types';
import { AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface CorrectionCardProps {
  correction: UserCorrection;
}

const CorrectionCard: React.FC<CorrectionCardProps> = ({ correction }) => {
  return (
    <div className="space-y-6">
      {/* Errors Section */}
      {correction.has_error ? (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-destructive/20">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4" />
            语法纠错
          </h3>
          <div className="space-y-4">
            {correction.errors.map((error, idx) => (
              <div key={idx} className="flex flex-col gap-2 border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-2 text-sm">
                  <span className="line-through text-destructive/50 shrink-0 mt-0.5">{error.original}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{error.corrected}</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                  <span className="font-semibold text-foreground/70 mr-1">原因:</span>
                  {error.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">表达正确！</h3>
            <p className="text-xs text-emerald-600/70 mt-0.5">你的句子结构非常棒，没有发现语法错误。</p>
          </div>
        </div>
      )}

      {/* Better Expressions Section */}
      {correction.better_expressions && correction.better_expressions.length > 0 && (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-primary/20">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            地道表达推荐
          </h3>
          <div className="space-y-4">
            {correction.better_expressions.map((expr, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-border last:border-0 pb-3 last:pb-0">
                <div className="font-medium text-primary text-sm">"{expr.expression}"</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{expr.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionCard;
