"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusActivityCard } from "@/components/ui/StatusActivityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModalDrawer } from "@/components/ui/ModalDrawer";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import {
  Users,
  UserCheck,
  CalendarDays,
  UserX,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Building,
} from "lucide-react";

export default function AdminDashboardPage() {
  const {
    userProfile,
    employees,
    leaveRequests,
    approveLeave,
    rejectLeave,
    searchTerm,
  } = useApp();

  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");

  // Metrics
  const totalEmp = employees.length;
  const presentEmp = employees.filter((e) => e.status === "present").length;
  const absentEmp = employees.filter((e) => e.status === "absent").length;

  // Filtered employees table
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleConfirmReject = () => {
    if (rejectingId) {
      rejectLeave(rejectingId, rejectComment || "Request denied by HR.");
      setRejectingId(null);
      setRejectComment("");
    }
  };

  // Right rail for Admin Dashboard
  const rightRailContent = (
    <>
      {/* Pending Leave Approvals Card */}
      <div className="dayflow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label">PENDING APPROVALS</div>
          <span className="text-[11px] font-semibold bg-[#EEEDFE] text-[#4f45ba] px-2 py-0.5 rounded-full">
            {pendingLeaves.length}
          </span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#8583A6]">
            No pending leave requests to review.
          </div>
        ) : (
          pendingLeaves.map((lr) => (
            <StatusActivityCard
              key={lr.id}
              variant="purple"
              title={lr.employeeName}
              subtitle={`${lr.type} (${lr.days}d) • ${lr.startDate}`}
              actionButtons={
                <div className="flex items-center justify-end gap-2 w-full">
                  <button
                    onClick={() => approveLeave(lr.id)}
                    className="px-2.5 py-1 bg-[#E1F5EE] hover:bg-[#085041] hover:text-white text-[#085041] text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(lr.id)}
                    className="px-2.5 py-1 bg-[#FCEBEB] hover:bg-[#791F1F] hover:text-white text-[#791F1F] text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              }
            />
          ))
        )}
      </div>

      {/* Mini Attendance Summary Card */}
      <div className="dayflow-card p-4 space-y-2">
        <div className="section-label">TODAY'S SHIFT SUMMARY</div>
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#8583A6]">On Time Check-ins</span>
            <span className="font-semibold text-[#085041]">80%</span>
          </div>
          <div className="w-full bg-[#F4F3FB] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#085041] h-full w-4/5" />
          </div>
          <div className="flex justify-between items-center pt-1 text-[11px] text-[#9C9AB8]">
            <span>Average hours today: 6.4h</span>
            <span>Target: 8.0h</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AppShell rightRail={rightRailContent}>
      {/* Greeting Header */}
      <GreetingHeader
        name={userProfile.name}
        subtitle="HR & Operations Administrator • Dayflow HRMS"
      />

      <div className="space-y-6">
        {/* Top Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="TOTAL EMPLOYEES"
            value={totalEmp}
            icon={Users}
            subtext="Active in directory"
            badge={{ text: "All Sync", variant: "purple" }}
          />
          <MetricCard
            label="PRESENT TODAY"
            value={presentEmp}
            icon={UserCheck}
            subtext="Checked in shift"
            badge={{ text: `${Math.round((presentEmp / totalEmp) * 100)}% Rate`, variant: "success" }}
          />
          <MetricCard
            label="PENDING LEAVES"
            value={pendingLeaves.length}
            icon={CalendarDays}
            subtext="Requires HR review"
            badge={{ text: "Action Needed", variant: "warning" }}
          />
          <MetricCard
            label="ABSENT TODAY"
            value={absentEmp}
            icon={UserX}
            subtext="Unplanned or off"
            badge={{ text: `${absentEmp} Staff`, variant: "danger" }}
          />
        </div>

        {/* Employee Directory Data Table */}
        <div className="dayflow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-medium text-[#2B2A45]">Employee Directory</h2>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Real-time status overview of company workforce
              </p>
            </div>

            {/* Department Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#8583A6]" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design & Product">Design & Product</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <EmptyState
              title="No employees match your search"
              message="Try searching by name, ID or choosing a different department."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">ID</th>
                    <th className="pb-3 px-3">Department</th>
                    <th className="pb-3 px-3">Check In</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEBF7] text-xs">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FDFDFE] transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#ECEBF7]"
                          />
                          <div>
                            <div className="font-medium text-[#2B2A45]">{emp.name}</div>
                            <div className="text-[11px] text-[#8583A6]">{emp.role}</div>
                          </div>
                        </div>
                      </td>
                      {/* ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-[#8583A6]">
                        {emp.id}
                      </td>
                      {/* Department */}
                      <td className="py-3 px-3 text-[#8583A6]">
                        <span className="inline-flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#9C9AB8]" />
                          {emp.department}
                        </span>
                      </td>
                      {/* Check-In Time */}
                      <td className="py-3 px-3 text-[#2B2A45] font-mono text-[11px]">
                        {emp.checkIn || "--:--"}
                      </td>
                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <StatusBadge status={emp.status} />
                      </td>
                      {/* Action Button */}
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/profile"
                          className="p-1.5 rounded-lg text-[#8583A6] hover:text-[#4f45ba] hover:bg-[#EEEDFE] inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Comment Modal */}
      <ModalDrawer
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject Leave Request"
        subtitle="Provide feedback to the employee regarding the rejection"
      >
        <div className="space-y-4">
          <FormFieldSet label="Rejection Reason / Comments" required>
            <textarea
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g. Mandatory team release scheduled during requested dates..."
              className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
            />
          </FormFieldSet>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECEBF7]">
            <button
              onClick={() => setRejectingId(null)}
              className="px-4 py-2 border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#8583A6] hover:bg-[#F4F3FB]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 bg-[#791F1F] hover:bg-[#5E1818] text-white rounded-lg text-xs font-medium"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </ModalDrawer>
    </AppShell>
  );
}
