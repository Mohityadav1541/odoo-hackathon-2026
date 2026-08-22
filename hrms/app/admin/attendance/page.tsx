"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Filter, Search, Calendar, Building } from "lucide-react";

export default function AdminAttendancePage() {
  const { employees, addToast } = useApp();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || emp.department === deptFilter;
    const matchStatus = statusFilter === "All" || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleExportCSV = () => {
    addToast("Export Started", "Downloading August_2026_Attendance.csv", "success");
  };

  return (
    <AppShell>
      {/* Greeting Header with Export Action */}
      <GreetingHeader
        name="Admin Attendance Console"
        subtitle="Monitor company-wide employee check-ins, timestamps, and hours worked"
        actionButton={
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[#4f45ba] text-[#4f45ba] hover:bg-[#EEEDFE] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="space-y-6">
        {/* Multi-Filter Bar */}
        <div className="dayflow-card p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9AB8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba]"
            />
          </div>

          {/* Department Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design & Product">Design & Product</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            >
              <option value="All">All Statuses</option>
              <option value="present">Present</option>
              <option value="half-day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Attendance Data Table Card */}
        <div className="dayflow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#2B2A45]">Attendance Log • Today</h3>
            <span className="text-xs text-[#8583A6]">
              Showing {filtered.length} of {employees.length} employees
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No logs found"
              message="No employee attendance records match your active search and filter filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Check In</th>
                    <th className="pb-3 px-3">Check Out</th>
                    <th className="pb-3 px-3">Hours Logged</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEBF7] text-xs">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FDFDFE] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#ECEBF7]"
                          />
                          <div>
                            <div className="font-medium text-[#2B2A45]">{emp.name}</div>
                            <div className="text-[11px] text-[#8583A6] font-mono">{emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#8583A6] font-mono text-[11px]">
                        Aug 22, 2026
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#2B2A45]">
                        {emp.checkIn || "--:--"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#2B2A45]">
                        {emp.checkOut || "--:--"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#2B2A45]">
                        {emp.hours ? `${emp.hours}h` : "0h"}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={emp.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
