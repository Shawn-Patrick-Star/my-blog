"use client";

import React from 'react';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { useChatStore } from '@/lib/eng-chat/store/useChatStore';
import { Settings, Cpu, GraduationCap, MessageSquare, Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onOpenSettings: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenSettings }) => {
  const { settings } = useSettingsStore();
  const { clearChat } = useChatStore();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire conversation?')) {
      clearChat();
      window.location.reload(); // Force reload to ensure state is fully fresh
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Model Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-[11px] font-medium text-gray-600 dark:text-zinc-400 border border-gray-200/50 dark:border-zinc-700/50">
          <Cpu className="w-3.5 h-3.5" />
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{settings.modelName}</span>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{settings.userLevel}</span>
        </div>

        {/* Topic Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 overflow-hidden">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="truncate">{settings.topic === 'Custom' ? settings.customTopic : settings.topic}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          className="p-2 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
          title="Clear Conversation"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 group"
          title="Settings"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
