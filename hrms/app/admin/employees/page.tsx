"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Filter, Mail, Phone, Building, UserPlus, Eye } from "lucide-react";

export default function AdminEmployeesPage() {
  const { employees, searchTerm, addToast } = useApp();
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [localSearch, setLocalSearch] = useState("");

  const effectiveSearch = localSearch || searchTerm;

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(effectiveSearch.toLowerCase());
    const matchDept = departmentFilter === "All" || emp.department === departmentFilter;
    return matchSearch && matchDept;
  });

  return (
    <AppShell>
      {/* Greeting Header with Add Employee Action */}
      <GreetingHeader
        name="Team & Employee Directory"
        subtitle="Manage workforce profiles, roles, and departmental assignments"
        actionButton={
          <button
            onClick={() => addToast("Add Employee Modal", "Employee onboarding workflow initiated.", "info")}
            className="px-4 py-2 bg-[#4f45ba] hover:bg-[#4038a3] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Employee
          </button>
        }
      />

      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="dayflow-card p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9AB8]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search team members by name, role or ID..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba]"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs font-medium text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design & Product">Design & Product</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No team members found"
            message="Try broadening your search query or department filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp) => (
              <div key={emp.id} className="dayflow-card p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#ECEBF7]"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-[#2B2A45]">{emp.name}</h3>
                      <p className="text-xs text-[#8583A6]">{emp.role}</p>
                      <span className="text-[10px] font-mono text-[#9C9AB8]">{emp.id}</span>
                    </div>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>

                <div className="space-y-1.5 text-xs text-[#8583A6] pt-3 border-t border-[#ECEBF7]">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#4f45ba]" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#4f45ba]" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#4f45ba]" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link
                    href="/profile"
                    className="w-full py-2 bg-[#F4F3FB] hover:bg-[#EEEDFE] text-[#4f45ba] rounded-lg text-xs font-medium text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
