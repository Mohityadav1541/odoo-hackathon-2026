"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar, Send, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ApplyLeavePage() {
  const { leaveBalances, leaveRequests, applyForLeave, userProfile } = useApp();

  const [leaveType, setLeaveType] = useState<"Paid Leave" | "Sick Leave" | "Casual Leave" | "Unpaid Leave">("Paid Leave");
  const [startDate, setStartDate] = useState("2026-08-28");
  const [endDate, setEndDate] = useState("2026-08-29");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const myRequests = leaveRequests.filter((l) => l.employeeId === userProfile.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setFormError("Please provide remarks or reason for leave application.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    setTimeout(() => {
      applyForLeave({
        type: leaveType,
        startDate,
        endDate,
        days: calculatedDays,
        remarks,
      });
      setIsSubmitting(false);
      setRemarks("");
    }, 600);
  };

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name={userProfile.name}
        subtitle="View leave balances and submit time-off requests"
      />

      <div className="space-y-6">
        {/* Top Leave Balance Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="PAID LEAVE BALANCE"
            value={`${leaveBalances.paid} Days Left`}
            icon={Calendar}
            subtext="Annual accrued leave"
            badge={{ text: "Available", variant: "purple" }}
          />
          <MetricCard
            label="SICK LEAVE BALANCE"
            value={`${leaveBalances.sick} Days Left`}
            icon={CheckCircle2}
            subtext="Accrued sick leave"
            badge={{ text: "Available", variant: "success" }}
          />
          <MetricCard
            label="UNPAID LEAVE"
            value={leaveBalances.unpaid}
            icon={ShieldAlert}
            subtext="Requires HR clearance"
            badge={{ text: "Flexible", variant: "neutral" }}
          />
        </div>

        {/* Leave Application Form Card */}
        <div className="dayflow-card p-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-[#2B2A45]">Apply for Leave</h3>
            <p className="text-xs text-[#8583A6] mt-0.5">
              Submit your time-off request for supervisor and HR approval
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Leave Type Dropdown */}
              <FormFieldSet label="Leave Category" required>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                >
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </FormFieldSet>

              {/* Start Date */}
              <FormFieldSet label="Start Date" required>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>

              {/* End Date */}
              <FormFieldSet label="End Date" required hint={`${calculatedDays} day(s) requested`}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>
            </div>

            {/* Remarks Textarea */}
            <FormFieldSet label="Reason & Remarks" required error={formError}>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Briefly state reason for leave request..."
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
              />
            </FormFieldSet>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* My Leave Requests Table Card */}
        <div className="dayflow-card p-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-[#2B2A45]">My Leave Requests</h3>
            <p className="text-xs text-[#8583A6] mt-0.5">
              Status tracking for submitted time-off requests
            </p>
          </div>

          {myRequests.length === 0 ? (
            <EmptyState
              title="No leave requests yet"
              message="You haven't submitted any leave applications."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                    <th className="pb-3 px-3">Req ID</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Duration</th>
                    <th className="pb-3 px-3">Days</th>
                    <th className="pb-3 px-3">Remarks</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEBF7] text-xs">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#FDFDFE] transition-colors">
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#8583A6]">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#2B2A45]">{req.type}</td>
                      <td className="py-3.5 px-3 text-[#8583A6] text-[11px]">
                        {req.startDate} to {req.endDate}
                      </td>
                      <td className="py-3.5 px-3 text-[#2B2A45] font-semibold">{req.days}d</td>
                      <td className="py-3.5 px-3 text-[#8583A6] max-w-xs truncate">
                        {req.remarks}
                        {req.rejectComment && (
                          <span className="block text-[11px] text-[#791F1F] font-normal">
                            Reason: {req.rejectComment}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={req.status} />
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
