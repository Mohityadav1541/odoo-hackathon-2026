"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Search, Bell, Shield, User } from "lucide-react";

interface TopSearchBarProps {
  onToggleNotifications: () => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({ onToggleNotifications }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole, addToast, notifications, searchTerm, setSearchTerm, userProfile } = useApp();

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleRoleToggle = () => {
    const nextRole = role === "employee" ? "admin" : "employee";
    setRole(nextRole);
    addToast(
      `Switched view to ${nextRole === "admin" ? "Admin / HR" : "Employee"}`,
      "Permissions and navigation updated.",
      "info"
    );

    if (nextRole === "admin" && (pathname === "/" || pathname === "/attendance" || pathname === "/leave" || pathname === "/payroll")) {
      router.push("/admin");
    } else if (nextRole === "employee" && (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/reports")) {
      router.push("/");
    }
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 mb-6">
      {/* Pill Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9AB8]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees, requests, docs..."
          className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] shadow-xs transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">


        {/* Notifications Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative w-9 h-9 rounded-full bg-white border border-[#ECEBF7] flex items-center justify-center text-[#2B2A45] hover:bg-[#F4F3FB] hover:border-[#4f45ba] transition-colors shadow-xs"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#2B2A45]" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4f45ba] ring-2 ring-white" />
          )}
        </button>

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-8 h-8 rounded-full object-cover border border-[#ECEBF7]"
          />
        </div>
      </div>
    </header>
  );
};
