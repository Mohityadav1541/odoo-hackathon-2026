"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  Users,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { role } = useApp();

  const navItems = [
    { label: "Dashboard", href: role === "admin" ? "/admin" : "/", icon: LayoutDashboard, role: "all" },
    { label: "Profile", href: "/profile", icon: User, role: "all" },
    { label: "Attendance", href: role === "admin" ? "/admin/attendance" : "/attendance", icon: Clock, role: "all" },
    { label: "Leave", href: role === "admin" ? "/admin/leave" : "/leave", icon: CalendarDays, role: "all" },
    { label: "Payroll", href: role === "admin" ? "/admin/payroll" : "/payroll", icon: CreditCard, role: "all" },
    { label: "Team", href: "/admin/employees", icon: Users, role: "admin" },
    { label: "Reports", href: "/reports", icon: BarChart3, role: "admin" },
  ];

  return (
    <aside className="w-16 md:w-18 bg-[#4f45ba] flex flex-col items-center justify-between py-5 shrink-0 z-30 fixed md:sticky top-0 bottom-0 left-0 h-screen text-white select-none">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-sm font-bold text-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-semibold tracking-wider text-white/90 uppercase">Dayflow</span>
      </div>

      {/* Nav Stack */}
      <nav className="flex flex-col items-center gap-3 my-auto w-full px-2">
        {navItems.map((item) => {
          if (item.role === "admin" && role !== "admin") return null;

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/admin" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                isActive
                  ? "bg-white/22 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/12 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip on hover */}
              <span className="absolute left-16 bg-[#2B2A45] text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/auth/signin"
          title="Sign Out"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/75 hover:bg-white/15 hover:text-white transition-all group relative"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-16 bg-[#2B2A45] text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
            Sign Out
          </span>
        </Link>
      </div>
    </aside>
  );
};
