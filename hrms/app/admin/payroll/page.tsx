"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { Save, Sparkles, CreditCard, RefreshCw, Calculator } from "lucide-react";

export default function AdminPayrollControlPage() {
  const { employees, updateEmployeeSalary, generateBatchPayslips, addToast } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || "EMP-1001");
  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const [selectedMonth, setSelectedMonth] = useState("2026-08");

  const [basic, setBasic] = useState(selectedEmp.basicSalary);
  const [hra, setHra] = useState(selectedEmp.hra);
  const [allowances, setAllowances] = useState(selectedEmp.allowances);
  const [deductions, setDeductions] = useState(selectedEmp.deductions);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedEmp) {
      setBasic(selectedEmp.basicSalary);
      setHra(selectedEmp.hra);
      setAllowances(selectedEmp.allowances);
      setDeductions(selectedEmp.deductions);
    }
  }, [selectedEmpId]);

  const grossCalculated = Number(basic) + Number(hra) + Number(allowances);
  const netCalculated = grossCalculated - Number(deductions);

  const handleSaveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateEmployeeSalary(selectedEmpId, {
        basicSalary: Number(basic),
        hra: Number(hra),
        allowances: Number(allowances),
        deductions: Number(deductions),
      });
      setIsSaving(false);
    }, 500);
  };

  return (
    <AppShell>
      {/* Greeting Header with Batch Payslip Generation Action */}
      <GreetingHeader
        name="Payroll Control Console"
        subtitle="Configure employee salary structures and run monthly batch payslip generation"
        actionButton={
          <button
            onClick={generateBatchPayslips}
            className="px-4 py-2 border border-[#4f45ba] text-[#4f45ba] hover:bg-[#EEEDFE] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Payslips for {selectedMonth}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Employee Search & Selector Card */}
        <div className="dayflow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Select Employee</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Choose an employee to adjust compensation breakdown
              </p>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
              />
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) • {emp.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Employee Selected Info */}
          <div className="mt-4 pt-4 border-t border-[#ECEBF7] flex items-center gap-3">
            <img
              src={selectedEmp.avatar}
              alt={selectedEmp.name}
              className="w-10 h-10 rounded-full object-cover border border-[#ECEBF7]"
            />
            <div>
              <h4 className="text-xs font-semibold text-[#2B2A45]">{selectedEmp.name}</h4>
              <p className="text-[11px] text-[#8583A6]">
                {selectedEmp.role} • {selectedEmp.department}
              </p>
            </div>
          </div>
        </div>

        {/* Live Salary Structure Form & Calculation Card */}
        <div className="dayflow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Salary Structure Configuration</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Modifications recalculate live net pay estimates
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#4f45ba] font-medium bg-[#EEEDFE] px-2.5 py-1 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              Live Calculator Active
            </div>
          </div>

          <form onSubmit={handleSaveStructure} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormFieldSet label="Basic Monthly Salary (₹)" required>
                <input
                  type="number"
                  value={basic}
                  onChange={(e) => setBasic(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs font-mono text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>

              <FormFieldSet label="House Rent Allowance (HRA) (₹)">
                <input
                  type="number"
                  value={hra}
                  onChange={(e) => setHra(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs font-mono text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>

              <FormFieldSet label="Special & Transport Allowances (₹)">
                <input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs font-mono text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>

              <FormFieldSet label="Tax & Benefit Deductions (₹)">
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs font-mono text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
                />
              </FormFieldSet>
            </div>

            {/* Live Calculation Display Box - Salary Overview */}
            <div className="dayflow-card overflow-hidden border border-[#ECEBF7] shadow-sm max-w-sm mt-6">
              <div className="bg-[#4f45ba] text-white p-4 font-medium text-sm flex items-center justify-between">
                Salary Overview
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Live Preview</span>
              </div>
              <div className="p-5 space-y-4 text-sm text-[#2B2A45]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8583A6]">Basic Salary</span>
                  <span className="font-medium font-mono">₹{basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8583A6]">Allowances</span>
                  <span className="font-medium font-mono">₹{(allowances + hra).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8583A6]">Deductions</span>
                  <span className="font-medium font-mono text-[#791F1F]">-₹{deductions.toLocaleString()}</span>
                </div>
                
                <div className="pt-4 mt-2 border-t border-[#ECEBF7] flex justify-between items-center">
                  <span className="font-semibold text-[#2B2A45]">Net Salary</span>
                  <span className="text-xl font-bold font-mono text-[#4f45ba]">₹{netCalculated.toLocaleString()}</span>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => addToast("Preview Slip", "Live salary slip preview generated.", "info")}
                    className="w-full py-2.5 bg-[#EEEDFE] hover:bg-[#4f45ba] hover:text-white text-[#4f45ba] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    View Salary Slip
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Salary Structure</span>
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
