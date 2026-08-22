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
  FolderKanban,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";

const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
    <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.523 2.527 2.527 0 0 1 2.521 2.523v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
    <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
    <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
    <path d="M15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.52-2.521h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
  </svg>
);

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { role } = useApp();

  const navItems = [
    {
      label: "Dashboard",
      href: role === "admin" ? "/admin" : "/",
      icon: LayoutDashboard,
      role: "all",
    },
    { label: "Profile", href: "/profile", icon: User, role: "all" },
    {
      label: "Attendance",
      href: role === "admin" ? "/admin/attendance" : "/attendance",
      icon: Clock,
      role: "all",
    },
    {
      label: "Leave",
      href: role === "admin" ? "/admin/leave" : "/leave",
      icon: CalendarDays,
      role: "all",
    },
    {
      label: "Payroll",
      href: role === "admin" ? "/admin/payroll" : "/payroll",
      icon: CreditCard,
      role: "all",
    },
    { label: "Projects", href: "/projects", icon: FolderKanban, role: "all" },
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

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2">
        <a
          href="https://join.slack.com/t/dayflowgroup/shared_invite/zt-47g8qevxz-0bhOATbgyFIZAkCfTI~A8w"
          target="_blank"
          rel="noopener noreferrer"
          title="Join Slack Community"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/75 hover:bg-white/15 hover:text-white transition-all group relative"
        >
          <SlackIcon className="w-5 h-5" />
          <span className="absolute left-16 bg-[#2B2A45] text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
            Join Slack Community
          </span>
        </a>

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
