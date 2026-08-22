"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  FileText,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsReportsPage() {
  const { addToast } = useApp();
  const [dateRange, setDateRange] = useState("august-2026");
  const [reportType, setReportType] = useState("attendance-monthly");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast("Report Generated", `PDF Report (${reportType}.pdf) downloaded.`, "success");
    }, 700);
  };

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name="Analytics & Reports Console"
        subtitle="Workforce metrics, attendance trends, leave distribution, and report exports"
      />

      <div className="space-y-6">
        {/* Date Range Filter Bar */}
        <div className="dayflow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4f45ba]" />
            <span className="text-xs font-medium text-[#2B2A45]">Active Reporting Period</span>
          </div>

          <div className="w-full sm:w-60">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            >
              <option value="august-2026">August 2026 (Current)</option>
              <option value="july-2026">July 2026</option>
              <option value="q2-2026">Q2 2026 Summary</option>
            </select>
          </div>
        </div>

        {/* Grid of Chart Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Attendance Trend (Custom Styled Line/Bar Chart) */}
          <div className="lg:col-span-2 dayflow-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="section-label">ATTENDANCE TREND</span>
                <h3 className="text-sm font-medium text-[#2B2A45] mt-0.5">Daily Check-in Rate</h3>
              </div>
              <span className="text-xs text-[#085041] font-semibold bg-[#E1F5EE] px-2.5 py-0.5 rounded-full">
                94.2% Avg Rate
              </span>
            </div>

            {/* SVG Custom Trend Chart in Purple/Teal */}
            <div className="w-full h-48 py-2 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#ECEBF7" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#ECEBF7" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#ECEBF7" strokeDasharray="3 3" />

                {/* Area Gradient */}
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f45ba" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f45ba" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10,90 Q 60,30 110,40 T 210,25 T 310,35 T 390,20 L 390,110 L 10,110 Z"
                  fill="url(#purpleGrad)"
                />

                {/* Trend Line */}
                <path
                  d="M 10,90 Q 60,30 110,40 T 210,25 T 310,35 T 390,20"
                  fill="none"
                  stroke="#4f45ba"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="10" cy="90" r="4" fill="#4f45ba" />
                <circle cx="110" cy="40" r="4" fill="#4f45ba" />
                <circle cx="210" cy="25" r="4" fill="#085041" />
                <circle cx="310" cy="35" r="4" fill="#4f45ba" />
                <circle cx="390" cy="20" r="4" fill="#4f45ba" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8583A6] pt-2 border-t border-[#ECEBF7]">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Current</span>
            </div>
          </div>

          {/* Chart 2: Leave Type Distribution (Donut Chart) */}
          <div className="dayflow-card p-6 flex flex-col justify-between">
            <div>
              <span className="section-label">LEAVE DISTRIBUTION</span>
              <h3 className="text-sm font-medium text-[#2B2A45] mt-0.5">By Category</h3>
            </div>

            <div className="my-4 flex items-center justify-center relative">
              <svg width="140" height="140" className="transform -rotate-90">
                {/* Segment 1: Paid (Purple) */}
                <circle cx="70" cy="70" r="50" stroke="#4f45ba" strokeWidth="16" strokeDasharray="314" strokeDashoffset="100" fill="none" />
                {/* Segment 2: Sick (Teal) */}
                <circle cx="70" cy="70" r="50" stroke="#085041" strokeWidth="16" strokeDasharray="314" strokeDashoffset="240" fill="none" />
                {/* Segment 3: Casual (Coral) */}
                <circle cx="70" cy="70" r="50" stroke="#F0997B" strokeWidth="16" strokeDasharray="314" strokeDashoffset="280" fill="none" />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-semibold text-[#2B2A45]">14</span>
                <span className="text-[10px] text-[#8583A6] block">Total Leaves</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#8583A6]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#4f45ba]" /> Paid Leaves
                </span>
                <span className="font-semibold text-[#2B2A45]">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#8583A6]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#085041]" /> Sick Leaves
                </span>
                <span className="font-semibold text-[#2B2A45]">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#8583A6]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F0997B]" /> Casual Leaves
                </span>
                <span className="font-semibold text-[#2B2A45]">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generator & Recent Reports Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator Form */}
          <div className="lg:col-span-2 dayflow-card p-6">
            <div className="mb-4">
              <h3 className="text-base font-medium text-[#2B2A45]">Report Generator</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Generate formatted PDF compliance reports for HR auditing
              </p>
            </div>

            <form onSubmit={handleGeneratePDF} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormFieldSet label="Report Type" required>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                  >
                    <option value="attendance-monthly">Monthly Attendance Summary</option>
                    <option value="leave-audits">Leave Audit Log</option>
                    <option value="payroll-disbursements">Payroll Disbursement Register</option>
                  </select>
                </FormFieldSet>

                <FormFieldSet label="Export Format" required>
                  <select className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]">
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="csv">CSV Spreadsheet (.csv)</option>
                  </select>
                </FormFieldSet>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isGenerating ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Generate & Download Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Generated Reports List */}
          <div className="dayflow-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-[#2B2A45]">Recent Reports</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">Quick download archive</p>
            </div>

            <div className="space-y-3 my-4">
              {[
                { name: "August_Attendance_Summary.pdf", date: "Today" },
                { name: "July_Payroll_Register.pdf", date: "Jul 31, 2026" },
                { name: "Q2_Leave_Audit.pdf", date: "Jul 01, 2026" },
              ].map((rep, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-[#ECEBF7] bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#4f45ba] shrink-0" />
                    <span className="truncate text-[#2B2A45] font-medium">{rep.name}</span>
                  </div>
                  <button
                    onClick={() => addToast("Downloading", rep.name, "success")}
                    className="text-[#4f45ba] hover:bg-[#EEEDFE] p-1 rounded-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-[#9C9AB8] text-center">
              Reports automatically archived after 90 days.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
