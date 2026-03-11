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
    if (window.confirm('确定要清空当前所有对话记录吗？')) {
      clearChat();
      window.location.reload(); 
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Model Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-[11px] font-medium text-muted-foreground border border-border/50">
          <Cpu className="w-3.5 h-3.5" />
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{settings.modelName || '未配置模型'}</span>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-[11px] font-medium text-primary border border-primary/20">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{settings.userLevel}</span>
        </div>

        {/* Topic Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 overflow-hidden">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="truncate">{settings.topic === '自定义' ? settings.customTopic : settings.topic}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          className="p-2 transition-all rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          title="清空对话"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 transition-all rounded-xl hover:bg-muted text-muted-foreground hover:text-primary group"
          title="设置"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
