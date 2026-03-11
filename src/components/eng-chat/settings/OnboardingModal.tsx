"use client";

import React, { useState } from 'react';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { UserLevel, Topic } from '@/lib/eng-chat/types';
import { GraduationCap, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { settings, updateSettings } = useSettingsStore();
  
  const [level, setLevel] = useState<UserLevel>(settings.userLevel);
  const [topic, setTopic] = useState<Topic>(settings.topic);
  const [customTopic, setCustomTopic] = useState(settings.customTopic);

  const handleStart = () => {
    updateSettings({
      userLevel: level,
      topic,
      customTopic,
      hasCompletedOnboarding: true,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800"
      >
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-fredoka"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md relative z-10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10 font-fredoka">Welcome to EngChat</h2>
          <p className="text-indigo-100 text-sm relative z-10">Let's set up your learning profile to personalize your experience.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Level Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
              What's your current English level?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as UserLevel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    level === l
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">
              {level === 'A1' || level === 'A2' ? 'Beginner: Simple words and sentences.' : 
               level === 'B1' || level === 'B2' ? 'Intermediate: Everyday conversations.' : 
               'Advanced: Complex topics and fluent expression.'}
            </p>
          </div>

          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
              What would you like to talk about?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Daily Life', 'Travel', 'Workplace', 'Academic', 'Custom'] as Topic[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    topic === t
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t === 'Custom' && <MessageSquare className="w-4 h-4" />}
                  {t}
                </button>
              ))}
            </div>
            
            {topic === 'Custom' && (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Ordering food at a restaurant"
                className="mt-3 w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm text-gray-900 dark:text-zinc-100"
              />
            )}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 font-medium rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            Start Learning
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
