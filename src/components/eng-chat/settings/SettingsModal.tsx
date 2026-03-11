"use client";

import React, { useState } from 'react';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { UserLevel, Topic, ApiMode } from '@/lib/eng-chat/types';
import { Settings, X, Save, Globe, Cpu, GraduationCap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 font-fredoka">EngChat Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8">
          {/* AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              AI Service Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">API Mode</label>
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {(['official', 'custom'] as ApiMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLocalSettings({ ...localSettings, apiMode: mode })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        localSettings.apiMode === mode
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">Model Name</label>
                <input
                  type="text"
                  value={localSettings.modelName}
                  onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
                  placeholder="e.g. gpt-4o, deepseek-chat"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
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
                  <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">Base URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={localSettings.baseUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">API Key</label>
                  <input
                    type="password"
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Learning Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Learning Profile
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">Current Level</label>
              <div className="grid grid-cols-6 gap-2">
                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as UserLevel[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocalSettings({ ...localSettings, userLevel: l })}
                    className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                      localSettings.userLevel === l
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 ml-1">Conversation Topic</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Daily Life', 'Travel', 'Workplace', 'Academic', 'Custom'] as Topic[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocalSettings({ ...localSettings, topic: t })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      localSettings.topic === t
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {t === 'Custom' && <MessageSquare className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
              {localSettings.topic === 'Custom' && (
                <input
                  type="text"
                  value={localSettings.customTopic}
                  onChange={(e) => setLocalSettings({ ...localSettings, customTopic: e.target.value })}
                  placeholder="e.g. Travel to Japan"
                  className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
