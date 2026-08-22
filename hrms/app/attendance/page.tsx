"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WeeklyBarStrip } from "@/components/ui/WeeklyBarStrip";
import { CircularProgressRing } from "@/components/ui/CircularProgressRing";
import { Clock, Calendar, CheckCircle2, AlertCircle, LogIn, LogOut } from "lucide-react";

export default function EmployeeAttendancePage() {
  const {
    userProfile,
    isCheckedIn,
    checkInTime,
    todayHours,
    weeklyAttendance,
    toggleCheckIn,
  } = useApp();

  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name={userProfile.name}
        subtitle="Track daily check-ins, shift hours, and weekly attendance history"
      />

      <div className="space-y-6">
        {/* View Segmented Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-white border border-[#ECEBF7] rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === "daily"
                  ? "bg-[#4f45ba] text-white shadow-xs"
                  : "text-[#8583A6] hover:text-[#2B2A45]"
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-[#4f45ba] text-white shadow-xs"
                  : "text-[#8583A6] hover:text-[#2B2A45]"
              }`}
            >
              Weekly History
            </button>
          </div>

          <span className="text-xs text-[#8583A6] hidden sm:inline">
            August 2026 Shift Schedule: 9:00 AM - 5:30 PM
          </span>
        </div>

        {/* Dynamic View Panel */}
        {viewMode === "daily" ? (
          <div className="dayflow-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Shift Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="section-label">TODAY'S SHIFT STAMP</span>
                <StatusBadge status={isCheckedIn ? "present" : "absent"} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7] text-xs">
                  <div className="flex items-center gap-2 text-[#8583A6]">
                    <LogIn className="w-4 h-4 text-[#085041]" /> Check-In Timestamp
                  </div>
                  <span className="font-mono font-medium text-[#2B2A45]">
                    {checkInTime || "09:02 AM"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7] text-xs">
                  <div className="flex items-center gap-2 text-[#8583A6]">
                    <LogOut className="w-4 h-4 text-[#791F1F]" /> Check-Out Timestamp
                  </div>
                  <span className="font-mono font-medium text-[#2B2A45]">
                    {isCheckedIn ? "--:-- (In Progress)" : "05:30 PM"}
                  </span>
                </div>
              </div>

              <button
                onClick={toggleCheckIn}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isCheckedIn
                    ? "bg-[#FCEBEB] text-[#791F1F] hover:bg-[#F9D6D6]"
                    : "bg-[#4f45ba] text-white hover:bg-[#4038a3]"
                }`}
              >
                {isCheckedIn ? "Check Out Now" : "Check In Now"}
              </button>
            </div>

            {/* Right Ring */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#FDFDFE] rounded-xl border border-[#ECEBF7]">
              <CircularProgressRing
                currentHours={isCheckedIn ? todayHours : 0}
                totalHours={8}
                isCheckedIn={isCheckedIn}
              />
            </div>
          </div>
        ) : (
          <div className="dayflow-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[#2B2A45]">7-Day Attendance Chart</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Detailed daily logged hours for the current week
              </p>
            </div>

            <WeeklyBarStrip days={weeklyAttendance} />

            {/* Calendar Mini Grid */}
            <div className="pt-4 border-t border-[#ECEBF7]">
              <div className="section-label mb-3">AUGUST 2026 CALENDAR GRID</div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="font-semibold text-[#8583A6] py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === 22;
                  const isWeekend = dayNum % 7 === 6 || dayNum % 7 === 0;

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-between h-14 ${
                        isToday
                          ? "bg-[#EEEDFE] border-[#4f45ba] text-[#4f45ba] font-semibold"
                          : isWeekend
                          ? "bg-[#F4F3FB] border-[#ECEBF7] text-[#9C9AB8]"
                          : "bg-white border-[#ECEBF7] text-[#2B2A45]"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {!isWeekend && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dayNum === 20
                              ? "bg-[#F0997B]"
                              : dayNum > 22
                              ? "bg-transparent"
                              : "bg-[#085041]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Summary Strip of Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="PRESENT DAYS"
            value="18 Days"
            icon={CheckCircle2}
            subtext="Target: 22 Days"
            badge={{ text: "On Track", variant: "success" }}
          />
          <MetricCard
            label="HALF DAYS"
            value="1 Day"
            icon={Clock}
            subtext="Aug 20 (4.2 hrs)"
            badge={{ text: "Logged", variant: "warning" }}
          />
          <MetricCard
            label="ABSENT DAYS"
            value="0 Days"
            icon={AlertCircle}
            subtext="Perfect record"
            badge={{ text: "Clean", variant: "success" }}
          />
          <MetricCard
            label="PAID LEAVES TAKEN"
            value="2 Days"
            icon={Calendar}
            subtext="Approved by HR"
            badge={{ text: "8 Remaining", variant: "purple" }}
          />
        </div>
      </div>
    </AppShell>
  );
}
