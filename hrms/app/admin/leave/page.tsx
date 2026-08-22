"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ModalDrawer } from "@/components/ui/ModalDrawer";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Check, X, Filter } from "lucide-react";

export default function AdminLeaveApprovalPage() {
  const { leaveRequests, approveLeave, rejectLeave } = useApp();

  const [activeTab, setActiveTab] = useState<"All" | "pending" | "approved" | "rejected">("All");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const filteredRequests = leaveRequests.filter((lr) => {
    if (activeTab === "All") return true;
    return lr.status === activeTab;
  });

  const handleConfirmReject = () => {
    if (rejectingId) {
      rejectLeave(rejectingId, rejectComment || "Declined due to team operational requirements.");
      setRejectingId(null);
      setRejectComment("");
    }
  };

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name="Leave Approvals Console"
        subtitle="Review, approve, or reject team leave applications"
      />

      <div className="space-y-6">
        {/* Pill-Style Filter Tab Row */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#ECEBF7] rounded-full w-fit shadow-xs">
          {(["All", "pending", "approved", "rejected"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === "All"
                ? leaveRequests.length
                : leaveRequests.filter((l) => l.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#4f45ba] text-white shadow-xs"
                    : "text-[#8583A6] hover:text-[#2B2A45]"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F4F3FB] text-[#8583A6]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Leave Requests Approval Table */}
        <div className="dayflow-card p-6">
          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No leave requests"
              message={`There are no leave applications in '${activeTab}' status.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Leave Type</th>
                    <th className="pb-3 px-3">Dates</th>
                    <th className="pb-3 px-3">Days</th>
                    <th className="pb-3 px-3">Remarks</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEBF7] text-xs">
                  {filteredRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-[#FDFDFE] transition-colors">
                      {/* Employee */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={lr.employeeAvatar}
                            alt={lr.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-[#ECEBF7]"
                          />
                          <div>
                            <div className="font-medium text-[#2B2A45]">{lr.employeeName}</div>
                            <div className="text-[11px] text-[#8583A6] font-mono">{lr.employeeId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="py-3.5 px-3 font-medium text-[#2B2A45]">{lr.type}</td>

                      {/* Dates */}
                      <td className="py-3.5 px-3 text-[#8583A6] text-[11px]">
                        {lr.startDate} to {lr.endDate}
                      </td>

                      {/* Days */}
                      <td className="py-3.5 px-3 font-semibold text-[#2B2A45]">{lr.days}d</td>

                      {/* Remarks */}
                      <td className="py-3.5 px-3 text-[#8583A6] max-w-xs truncate">
                        {lr.remarks}
                        {lr.rejectComment && (
                          <span className="block text-[11px] text-[#791F1F] font-normal">
                            Reason: {lr.rejectComment}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={lr.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        {lr.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveLeave(lr.id)}
                              className="p-1.5 rounded-lg bg-[#E1F5EE] hover:bg-[#085041] text-[#085041] hover:text-white transition-colors cursor-pointer"
                              title="Approve Request"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRejectingId(lr.id)}
                              className="p-1.5 rounded-lg bg-[#FCEBEB] hover:bg-[#791F1F] text-[#791F1F] hover:text-white transition-colors cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#9C9AB8]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <ModalDrawer
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject Leave Request"
        subtitle="Specify why this leave application is being rejected"
      >
        <div className="space-y-4">
          <FormFieldSet label="Rejection Reason" required>
            <textarea
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g. Mandatory project deadline during requested period..."
              className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            />
          </FormFieldSet>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECEBF7]">
            <button
              onClick={() => setRejectingId(null)}
              className="px-4 py-2 border border-[#ECEBF7] text-[#8583A6] rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 bg-[#791F1F] text-white rounded-lg text-xs font-medium"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </ModalDrawer>
    </AppShell>
  );
}
