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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-red-100 dark:border-red-900/30">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Corrections
          </h3>
          <div className="space-y-4">
            {correction.errors.map((error, idx) => (
              <div key={idx} className="flex flex-col gap-2 border-b border-gray-50 dark:border-zinc-800 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-2 text-sm">
                  <span className="line-through text-red-400 dark:text-red-600 shrink-0 mt-0.5">{error.original}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{error.corrected}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg">
                  <span className="font-semibold text-gray-700 dark:text-zinc-300 mr-1">Reason:</span>
                  {error.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Perfect Grammar!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Your sentence structure is spot on.</p>
          </div>
        </div>
      )}

      {/* Better Expressions Section */}
      {correction.better_expressions && correction.better_expressions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-amber-100 dark:border-amber-900/30">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Sound More Native
          </h3>
          <div className="space-y-4">
            {correction.better_expressions.map((expr, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-gray-50 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
                <div className="font-medium text-amber-700 dark:text-amber-500 text-sm">"{expr.expression}"</div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{expr.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionCard;
