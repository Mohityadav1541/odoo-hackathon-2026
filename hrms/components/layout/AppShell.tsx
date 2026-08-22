"use client";

import React, { useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { TopSearchBar } from "./TopSearchBar";
import { NotificationsPanel } from "./NotificationsPanel";
import { ToastContainer } from "@/components/ui/ToastNotification";

interface AppShellProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, rightRail }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4F3FB] font-sans antialiased text-[#2B2A45]">
      {/* Fixed Left Sidebar */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6">
          {/* Main Column */}
          <main className="flex-1 min-w-0">
            <TopSearchBar onToggleNotifications={() => setIsNotificationsOpen(true)} />
            {children}
          </main>

          {/* Optional Right Rail (~220px to 260px wide, white card background feel) */}
          {rightRail && (
            <aside className="w-full lg:w-68 shrink-0 space-y-4">
              {rightRail}
            </aside>
          )}
        </div>
      </div>

      {/* Global Slide-Over Notifications */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};
