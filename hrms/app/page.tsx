"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { CircularProgressRing } from "@/components/ui/CircularProgressRing";
import { WeeklyBarStrip } from "@/components/ui/WeeklyBarStrip";
import { QuickActionTile } from "@/components/ui/QuickActionTile";
import { StatusActivityCard } from "@/components/ui/StatusActivityCard";
import {
  CalendarDays,
  User,
  CreditCard,
  Users,
  LogIn,
  LogOut as LogOutIcon,
  Clock,
  FileText,
  Mail,
  Zap,
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const {
    userProfile,
    isCheckedIn,
    checkInTime,
    todayHours,
    toggleCheckIn,
    weeklyAttendance,
    leaveRequests,
    payslips,
    quickSettings,
    toggleQuickSetting,
  } = useApp();

  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
  const latestPayslip = payslips[0];

  // Right rail content for Employee Dashboard
  const rightRailContent = (
    <>
      {/* Quick Settings Card */}
      <div className="dayflow-card p-4">
        <div className="section-label mb-3">QUICK SETTINGS</div>
        <div className="space-y-3">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#8583A6]" />
              <span className="text-xs text-[#2B2A45] font-medium">Email Alerts</span>
            </div>
            <button
              onClick={() => toggleQuickSetting("emailAlerts")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                quickSettings.emailAlerts ? "bg-[#4f45ba]" : "bg-[#D8D6E9]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  quickSettings.emailAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Auto Check-in Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ECEBF7]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#8583A6]" />
              <span className="text-xs text-[#2B2A45] font-medium">Auto Check-in</span>
            </div>
            <button
              onClick={() => toggleQuickSetting("autoCheckIn")}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                quickSettings.autoCheckIn ? "bg-[#4f45ba]" : "bg-[#D8D6E9]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  quickSettings.autoCheckIn ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Status & Activity Cards */}
      <div className="dayflow-card p-4 space-y-3">
        <div className="section-label mb-2">STATUS & ACTIVITIES</div>

        {/* Purple filled card variant for pending leave */}
        {pendingLeaves.length > 0 ? (
          <StatusActivityCard
            variant="purple"
            title="Leave Request Pending"
            subtitle={`${pendingLeaves[0].type} (${pendingLeaves[0].days} days)`}
            timestamp={`Applied on ${pendingLeaves[0].appliedDate}`}
            badgeText="Pending HR"
          />
        ) : (
          <StatusActivityCard
            variant="purple"
            title="All Leaves Up to Date"
            subtitle="No pending requests"
            badgeText="Clear"
          />
        )}

        {/* Neutral white card variant for latest payslip */}
        {latestPayslip && (
          <StatusActivityCard
            variant="white"
            title={`Payslip: ${latestPayslip.month}`}
            subtitle={`Net Pay: $${latestPayslip.net.toLocaleString()}`}
            timestamp={`Issued ${latestPayslip.issuedDate}`}
            badgeText={latestPayslip.status}
          />
        )}

        {/* Neutral white card for attendance summary */}
        <StatusActivityCard
          variant="white"
          title="Monthly Attendance"
          subtitle="18 Days Present • 1 Half Day"
          timestamp="August 2026 Target: 22 Days"
        />
      </div>
    </>
  );

  return (
    <AppShell rightRail={rightRailContent}>
      {/* Greeting Header */}
      <GreetingHeader
        name={userProfile.name}
        subtitle={`${userProfile.role} • ${userProfile.department}`}
      />

      <div className="space-y-6">
        {/* Top Hero Section: Check-In / Check-Out Controls + Hours Ring Card */}
        <div className="dayflow-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Flanked Check-in / Out Action Tile */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="section-label mb-1">TODAY'S WORKDAY STATUS</div>
              <h3 className="text-base font-medium text-[#2B2A45]">
                {isCheckedIn ? "Checked In at " + (checkInTime || "09:02 AM") : "Currently Checked Out"}
              </h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                {isCheckedIn
                  ? "Timer is active. Keep up the great work!"
                  : "Click below when you begin or resume your shift."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {/* Check-In Tile */}
              <button
                onClick={toggleCheckIn}
                disabled={isCheckedIn}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  isCheckedIn
                    ? "bg-[#E1F5EE] border-[#085041]/20 text-[#085041] opacity-75 cursor-default"
                    : "bg-[#4f45ba] hover:bg-[#4038a3] text-white border-transparent cursor-pointer shadow-xs"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCheckedIn ? "bg-[#085041]/10 text-[#085041]" : "bg-white/20 text-white"}`}>
                  <LogIn className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold">Check In</div>
                  <div className="text-[10px] opacity-80">{isCheckedIn ? "Active" : "Start Shift"}</div>
                </div>
              </button>

              {/* Check-Out Tile */}
              <button
                onClick={toggleCheckIn}
                disabled={!isCheckedIn}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  !isCheckedIn
                    ? "bg-[#F4F3FB] border-[#ECEBF7] text-[#8583A6] opacity-75 cursor-default"
                    : "bg-white hover:bg-[#FCEBEB] text-[#791F1F] border-[#ECEBF7] hover:border-[#FCEBEB] cursor-pointer"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isCheckedIn ? "bg-[#8583A6]/10 text-[#8583A6]" : "bg-[#FCEBEB] text-[#791F1F]"}`}>
                  <LogOutIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold">Check Out</div>
                  <div className="text-[10px] opacity-80">{!isCheckedIn ? "Shift Ended" : "End Shift"}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="shrink-0 flex items-center justify-center p-2 bg-[#FDFDFE] rounded-2xl border border-[#ECEBF7]">
            <CircularProgressRing
              currentHours={isCheckedIn ? todayHours : 0}
              totalHours={8}
              isCheckedIn={isCheckedIn}
            />
          </div>
        </div>

        {/* THIS WEEK Attendance Bar Strip */}
        <div className="dayflow-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="section-label">THIS WEEK</div>
              <h3 className="text-sm font-medium text-[#2B2A45] mt-0.5">Attendance Overview</h3>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-medium text-[#4f45ba] hover:underline flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              Full History
            </Link>
          </div>
          <WeeklyBarStrip days={weeklyAttendance} />
        </div>

        {/* 4-Tile Quick Action Grid */}
        <div>
          <div className="section-label mb-3">QUICK ACTIONS</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/leave">
              <QuickActionTile
                label="Apply Leave"
                icon={CalendarDays}
                onClick={() => {}}
                badgeCount={pendingLeaves.length}
              />
            </Link>
            <Link href="/profile">
              <QuickActionTile label="My Profile" icon={User} onClick={() => {}} />
            </Link>
            <Link href="/payroll">
              <QuickActionTile label="Payslips" icon={CreditCard} onClick={() => {}} />
            </Link>
            <Link href="/attendance">
              <QuickActionTile label="Team Calendar" icon={Users} onClick={() => {}} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
