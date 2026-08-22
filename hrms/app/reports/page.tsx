"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsReportsPage() {
  const { fiveYearSalaryReports, addToast } = useApp();
  const [reportType, setReportType] = useState("salary-5-year");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast("Report Exported", `Report (${reportType}.pdf) from ${startDate} to ${endDate} downloaded.`, "success");
    }, 700);
  };

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name="Analytics & Reports Console"
        subtitle="Workforce metrics, attendance trends, 5-year salary reports, and date-range exports"
      />

      <div className="space-y-6">
        {/* Interactive Calendar Date Range Filter Bar */}
        <div className="dayflow-card p-5 bg-white space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#4f45ba]" />
            <h3 className="text-xs font-semibold text-[#2B2A45] uppercase tracking-wider">
              Calendar Date Range Selector
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#8583A6] font-medium mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8583A6] font-medium mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => addToast("Date Range Applied", `Filtered data for ${startDate} to ${endDate}`, "info")}
                className="w-full py-2 bg-[#EEEDFE] hover:bg-[#4f45ba] hover:text-white text-[#4f45ba] text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Apply Calendar Filter
              </button>
            </div>
          </div>
        </div>

        {/* 5-Year Salary Report Section */}
        <div className="dayflow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="section-label">HISTORICAL PAYROLL ANALYTICS</span>
              <h2 className="text-base font-medium text-[#2B2A45] mt-0.5">
                5-Year Salary & Compensation Report (2022 – 2026)
              </h2>
            </div>
            <span className="text-xs text-[#085041] font-semibold bg-[#E1F5EE] px-3 py-1 rounded-full w-fit">
              Average Growth: +10.2% / year
            </span>
          </div>

          {/* SVG 5-Year Salary Bar Chart */}
          <div className="w-full h-52 py-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#ECEBF7" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#ECEBF7" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#ECEBF7" strokeDasharray="3 3" />

              {/* Bars for 2022 to 2026 */}
              {(fiveYearSalaryReports || []).slice().reverse().map((rep: any, idx: number) => {
                const height = (rep.totalNetPaid / 350000) * 100;
                const x = 30 + idx * 95;
                const y = 110 - height;

                return (
                  <g key={rep.year}>
                    <rect
                      x={x}
                      y={y}
                      width="40"
                      height={height}
                      rx="6"
                      fill={rep.year === 2026 ? "#4f45ba" : "#D8D6E9"}
                      className="hover:fill-[#4038a3] transition-colors cursor-pointer"
                    />
                    <text
                      x={x + 20}
                      y={y - 6}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-[#2B2A45]"
                    >
                      ${(rep.totalNetPaid / 1000).toFixed(0)}k
                    </text>
                    <text
                      x={x + 20}
                      y="125"
                      textAnchor="middle"
                      className="text-[11px] font-medium fill-[#8583A6]"
                    >
                      {rep.year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 5-Year Salary Data Table */}
          <div className="overflow-x-auto pt-2 border-t border-[#ECEBF7]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                  <th className="pb-3 px-3">Year</th>
                  <th className="pb-3 px-3">Total Gross</th>
                  <th className="pb-3 px-3">Tax & Deductions</th>
                  <th className="pb-3 px-3">Total Net Payout</th>
                  <th className="pb-3 px-3">Avg Salary / Emp</th>
                  <th className="pb-3 px-3">Headcount</th>
                  <th className="pb-3 px-3 text-right">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEBF7] text-xs">
                {(fiveYearSalaryReports || []).map((rep: any) => (
                  <tr key={rep.year} className="hover:bg-[#FDFDFE] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#2B2A45]">{rep.year}</td>
                    <td className="py-3 px-3 font-mono text-[#2B2A45]">
                      ${rep.totalGross.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#791F1F]">
                      -${rep.totalDeductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#4f45ba]">
                      ${rep.totalNetPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#2B2A45]">
                      ${rep.avgEmployeeSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-[#8583A6]">{rep.headcount} Staff</td>
                    <td className="py-3 px-3 text-right font-medium text-[#085041]">
                      {rep.growthRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Trend & Leave Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Attendance Trend */}
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

            <div className="w-full h-44 py-2 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                <line x1="0" y1="20" x2="400" y2="20" stroke="#ECEBF7" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#ECEBF7" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#ECEBF7" strokeDasharray="3 3" />

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

                <path
                  d="M 10,90 Q 60,30 110,40 T 210,25 T 310,35 T 390,20"
                  fill="none"
                  stroke="#4f45ba"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

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

          {/* Chart 2: Leave Distribution */}
          <div className="dayflow-card p-6 flex flex-col justify-between">
            <div>
              <span className="section-label">LEAVE DISTRIBUTION</span>
              <h3 className="text-sm font-medium text-[#2B2A45] mt-0.5">By Category</h3>
            </div>

            <div className="my-4 flex items-center justify-center relative">
              <svg width="130" height="130" className="transform -rotate-90">
                <circle cx="65" cy="65" r="45" stroke="#4f45ba" strokeWidth="14" strokeDasharray="283" strokeDashoffset="90" fill="none" />
                <circle cx="65" cy="65" r="45" stroke="#085041" strokeWidth="14" strokeDasharray="283" strokeDashoffset="210" fill="none" />
                <circle cx="65" cy="65" r="45" stroke="#F0997B" strokeWidth="14" strokeDasharray="283" strokeDashoffset="250" fill="none" />
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

        {/* Report Generator Form */}
        <div className="dayflow-card p-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-[#2B2A45]">Report Generator</h3>
            <p className="text-xs text-[#8583A6] mt-0.5">
              Export custom compliance documents based on your active date selections
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
                  <option value="salary-5-year">5-Year Salary & Compensation Report</option>
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
      </div>
    </AppShell>
  );
}
