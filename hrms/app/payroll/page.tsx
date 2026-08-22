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
        {/* Salary Overview Card */}
        <div className="dayflow-card max-w-sm overflow-hidden border border-[#ECEBF7] shadow-sm">
          <div className="bg-[#4f45ba] text-white p-4 font-medium text-sm flex items-center justify-between">
            Salary Overview
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">August 2026</span>
          </div>
          <div className="p-5 space-y-4 text-sm text-[#2B2A45]">
            <div className="flex justify-between items-center">
              <span className="text-[#8583A6]">Basic Salary</span>
              <span className="font-medium font-mono">₹{userProfile.basicSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8583A6]">Allowances</span>
              <span className="font-medium font-mono">₹{(userProfile.allowances + userProfile.hra).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8583A6]">Deductions</span>
              <span className="font-medium font-mono text-[#791F1F]">-₹{deductions.toLocaleString()}</span>
            </div>
            
            <div className="pt-4 mt-2 border-t border-[#ECEBF7] flex justify-between items-center">
              <span className="font-semibold text-[#2B2A45]">Net Salary</span>
              <span className="text-xl font-bold font-mono text-[#4f45ba]">₹{net.toLocaleString()}</span>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleDownloadSlip("August 2026")}
                className="w-full py-2.5 bg-[#EEEDFE] hover:bg-[#4f45ba] hover:text-white text-[#4f45ba] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                View Salary Slip
              </button>
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
                      ₹{ps.gross.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#791F1F]">
                      -₹{ps.deductions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#4f45ba]">
                      ₹{ps.net.toLocaleString()}
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
