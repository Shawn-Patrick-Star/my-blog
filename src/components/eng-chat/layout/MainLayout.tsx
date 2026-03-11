"use client";

import React, { ReactNode } from 'react';

interface MainLayoutProps {
  chatArea: ReactNode;
  monitorArea: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ chatArea, monitorArea }) => {
  return (
    <div className="h-full w-full max-w-7xl mx-auto px-4 py-4 lg:py-8 flex gap-6 overflow-hidden">
      {/* Container Box */}
      <div className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 relative">
        {/* Chat Area - Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {chatArea}
        </div>

        {/* Monitor Area - Sidebar inside box */}
        <div className="hidden xl:block w-80 2xl:w-96 flex-shrink-0 border-l border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
          {monitorArea}
        </div>
      </div>

      {/* Optional: We could keep monitorArea outside or inside. Inside feels more like a "tool" site. */}
    </div>
  );
};

export default MainLayout;
