"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SidebarNav } from "./SidebarNav";
import { TopSearchBar } from "./TopSearchBar";
import { NotificationsPanel } from "./NotificationsPanel";
import { ToastContainer } from "@/components/ui/ToastNotification";
import { AIChatbotWidget } from "@/components/ui/AIChatbotWidget";
import { ShieldAlert, ArrowRight, Lock, UserCheck } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, rightRail }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useApp();

  // Role Access Isolation Check
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/reports";
  const isEmployeeRoute = pathname === "/" || pathname === "/attendance" || pathname === "/leave" || pathname === "/payroll";

  const isEmployeeAccessingAdmin = role === "employee" && isAdminRoute;
  const isAdminAccessingEmployee = role === "admin" && isEmployeeRoute;

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

            {/* Access Guard for Employee trying to access HR Page */}
            {isEmployeeAccessingAdmin ? (
              <div className="dayflow-card p-8 text-center max-w-lg mx-auto my-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FCEBEB] text-[#791F1F] flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[#2B2A45]">Access Restricted</h2>
                  <p className="text-xs text-[#8583A6] mt-1 leading-relaxed">
                    HR & Operations Management privileges are required to view this page. You are currently logged in with an Employee role.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="px-4 py-2 bg-[#4f45ba] text-white text-xs font-medium rounded-lg hover:bg-[#4038a3] transition-colors flex items-center gap-1.5"
                  >
                    Return to Employee Home <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : isAdminAccessingEmployee ? (
              /* Access Guard for HR trying to access Employee Page */
              <div className="dayflow-card p-8 text-center max-w-lg mx-auto my-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#EEEDFE] text-[#4f45ba] flex items-center justify-center mx-auto">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[#2B2A45]">HR Console Mode Active</h2>
                  <p className="text-xs text-[#8583A6] mt-1 leading-relaxed">
                    You are in HR Administrator mode. Please use your designated Admin Console pages for workforce operations.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-[#4f45ba] text-white text-xs font-medium rounded-lg hover:bg-[#4038a3] transition-colors flex items-center gap-1.5"
                  >
                    Go to HR Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </main>

          {/* Optional Right Rail (~220px to 260px wide) */}
          {!isEmployeeAccessingAdmin && !isAdminAccessingEmployee && rightRail && (
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

      {/* Global Floating AI Chatbot Widget */}
      <AIChatbotWidget />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};
