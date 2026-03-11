"use client";

import React, { useState } from 'react';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { UserLevel, Topic } from '@/lib/eng-chat/types';
import { GraduationCap, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const levels: UserLevel[] = ['中高考', '四级', '六级', '雅思&托福', '留学', '实用英语'];
  const topics: Topic[] = ['日常生活', '旅行出行', '职场办公', '学术校园', '自定义'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-border"
      >
        <div className="bg-primary p-8 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-fredoka"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md relative z-10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10 font-fredoka">欢迎来到 EngChat</h2>
          <p className="opacity-80 text-sm relative z-10">设置你的学习档案，开启个性化对话。</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Level Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
              你的英语目标 / 水平？
            </label>
            <div className="grid grid-cols-3 gap-3">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    level === l
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
              你想聊什么话题？
            </label>
            <div className="grid grid-cols-2 gap-3">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    topic === t
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {t === '自定义' && <MessageSquare className="w-4 h-4" />}
                  {t}
                </button>
              ))}
            </div>
            
            {topic === '自定义' && (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="例如: 模拟面试, 电影讨论"
                className="mt-3 w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground"
              />
            )}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            开始学习
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
