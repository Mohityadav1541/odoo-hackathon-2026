"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Download, CreditCard, DollarSign, PieChart, CheckCircle2 } from "lucide-react";

export default function EmployeePayrollPage() {
  const { userProfile, payslips, addToast } = useApp();

  const gross = userProfile.basicSalary + userProfile.hra + userProfile.allowances;
  const deductions = userProfile.deductions;
  const net = gross - deductions;

  const handleDownloadSlip = (month: string) => {
    addToast("Downloading Payslip", `Payslip PDF for ${month} saved to downloads.`, "success");
  };

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name={userProfile.name}
        subtitle="View salary breakdown, tax deductions, and historical monthly payslips"
      />

      <div className="space-y-6">
        {/* Top Summary Card: 3-Column Metric Layout */}
        <div className="dayflow-card p-6 bg-gradient-to-r from-white via-white to-[#EEEDFE]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="section-label">CURRENT MONTH SALARY BREAKDOWN</span>
              <h3 className="text-sm font-medium text-[#2B2A45] mt-0.5">August 2026 Estimated Pay</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Payroll Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Gross Pay */}
            <div className="p-4 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
              <span className="text-xs text-[#8583A6] font-medium block">Total Gross Salary</span>
              <div className="text-2xl font-semibold text-[#2B2A45] mt-1">
                ${gross.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#8583A6] mt-1 block">
                Basic (${userProfile.basicSalary}) + HRA (${userProfile.hra}) + Allowances (${userProfile.allowances})
              </span>
            </div>

            {/* Deductions */}
            <div className="p-4 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
              <span className="text-xs text-[#8583A6] font-medium block">Total Deductions</span>
              <div className="text-2xl font-semibold text-[#791F1F] mt-1">
                -${deductions.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#8583A6] mt-1 block">
                Tax, Health Insurance, PF Contributions
              </span>
            </div>

            {/* Net Pay */}
            <div className="p-4 rounded-xl bg-[#EEEDFE] border border-[#D8D6E9]">
              <span className="text-xs text-[#4f45ba] font-semibold block">Net Takehome Pay</span>
              <div className="text-2xl font-semibold text-[#4f45ba] mt-1">
                ${net.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#4f45ba] mt-1 block font-medium">
                Scheduled Disbursement: Aug 31, 2026
              </span>
            </div>
          </div>
        </div>

        {/* Payslip History Table Card */}
        <div className="dayflow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Payslip History</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">Download monthly digital salary slips</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEBF7] text-[11px] font-semibold text-[#8583A6] uppercase tracking-wider">
                  <th className="pb-3 px-3">Statement Period</th>
                  <th className="pb-3 px-3">Gross Pay</th>
                  <th className="pb-3 px-3">Deductions</th>
                  <th className="pb-3 px-3">Net Pay</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEBF7] text-xs">
                {payslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-[#FDFDFE] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] text-[#4f45ba] flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-[#2B2A45]">{ps.month}</div>
                          <div className="text-[10px] text-[#8583A6]">Issued {ps.issuedDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#2B2A45]">
                      ${ps.gross.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#791F1F]">
                      -${ps.deductions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#4f45ba]">
                      ${ps.net.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={ps.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadSlip(ps.month)}
                        className="px-3 py-1.5 bg-[#EEEDFE] hover:bg-[#4f45ba] hover:text-white text-[#4f45ba] rounded-lg text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        PDF Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
