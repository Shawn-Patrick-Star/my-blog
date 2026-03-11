"use client";

import React, { useState } from 'react';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { UserLevel, Topic, ApiMode } from '@/lib/eng-chat/types';
import { Settings, X, Save, Globe, Cpu, GraduationCap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettingsStore();
  
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const levels: UserLevel[] = ['中高考', '四级', '六级', '雅思&托福', '留学', '实用英语'];
  const topics: Topic[] = ['日常生活', '旅行出行', '职场办公', '学术校园', '自定义'];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-border"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-fredoka">聊天设置</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8">
          {/* AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              AI 服务配置
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">API 模式</label>
                <div className="flex bg-muted p-1 rounded-xl">
                  {(['official', 'custom'] as ApiMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLocalSettings({ ...localSettings, apiMode: mode })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        localSettings.apiMode === mode
                          ? 'bg-card text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode === 'official' ? '环境变量' : '手动填写'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">模型名称</label>
                <input
                  type="text"
                  value={localSettings.modelName}
                  onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
                  placeholder="如: deepseek-chat, gpt-4o"
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {localSettings.apiMode === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Base URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={localSettings.baseUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="w-full pl-11 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">API Key</label>
                  <input
                    type="password"
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Learning Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              学习目标
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground ml-1">当前水平 / 考试目标</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocalSettings({ ...localSettings, userLevel: l })}
                    className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                      localSettings.userLevel === l
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground ml-1">练习场景</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocalSettings({ ...localSettings, topic: t })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      localSettings.topic === t
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {t === '自定义' && <MessageSquare className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
              {localSettings.topic === '自定义' && (
                <input
                  type="text"
                  value={localSettings.customTopic}
                  onChange={(e) => setLocalSettings({ ...localSettings, customTopic: e.target.value })}
                  placeholder="例如: 模拟面试, 餐厅点餐"
                  className="w-full mt-2 px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border flex justify-end gap-3 bg-muted/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-primary hover:opacity-90 text-primary-foreground text-sm font-medium rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
