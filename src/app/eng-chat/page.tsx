"use client";

import { useState } from 'react';
import MainLayout from '@/components/eng-chat/layout/MainLayout';
import ChatArea from '@/components/eng-chat/chat/ChatArea';
import MonitorPanel from '@/components/eng-chat/monitor/MonitorPanel';
import OnboardingModal from '@/components/eng-chat/settings/OnboardingModal';
import { useSettingsStore } from '@/lib/eng-chat/store/useSettingsStore';
import { useChatStore } from '@/lib/eng-chat/store/useChatStore';

export default function EngChatPage() {
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const { settings } = useSettingsStore();
  const { clearChat } = useChatStore();

  const handleAnalyzeClick = (messageId: string) => {
    setActiveAnalysisId(messageId === activeAnalysisId ? null : messageId);
  };

  const handleCorrectionClick = (messageId: string) => {
    setActiveAnalysisId(messageId === activeAnalysisId ? null : messageId);
  };

  const handleOnboardingComplete = () => {
    clearChat();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <MainLayout
          chatArea={
            <ChatArea
              onAnalyzeClick={handleAnalyzeClick}
              onCorrectionClick={handleCorrectionClick}
              activeAnalysisId={activeAnalysisId}
            />
          }
          monitorArea={
            <MonitorPanel
              activeAnalysisId={activeAnalysisId}
              onClose={() => setActiveAnalysisId(null)}
            />
          }
        />
      </div>
      {!settings.hasCompletedOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}
