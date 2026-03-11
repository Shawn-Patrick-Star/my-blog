"use client";

import React, { ReactNode } from 'react';

interface MainLayoutProps {
  chatArea: ReactNode;
  monitorArea: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ chatArea, monitorArea }) => {
  return (
    <div className="h-full w-full max-w-7xl mx-auto py-4 lg:py-8 flex gap-6 overflow-hidden">
      {/* Container Box */}
      <div className="flex-1 flex overflow-hidden bg-card rounded-3xl border border-border relative">
        {/* Chat Area - Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {chatArea}
        </div>

        {/* Monitor Area - Sidebar inside box */}
        <div className="hidden xl:block w-80 2xl:w-96 flex-shrink-0 border-l border-border bg-muted/30">
          {monitorArea}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
