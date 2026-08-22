"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FolderKanban,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building,
  Plus,
} from "lucide-react";

export default function ProjectsPage() {
  const { projects, searchTerm, role, userProfile, addToast } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");

  const filteredProjects = projects.filter((prj) => {
    // If employee, only show projects they are involved in
    if (role === "employee") {
      const isMember = prj.team.some((m) => m.id === userProfile.id);
      const isManager = prj.manager === userProfile.name;
      if (!isMember && !isManager) return false;
    }
    const matchSearch =
      prj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prj.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prj.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "All" || prj.status === statusFilter;
    const matchDept = deptFilter === "All" || prj.department === deptFilter;

    return matchSearch && matchStatus && matchDept;
  });

  return (
    <AppShell>
      {/* Greeting Header */}
      <GreetingHeader
        name="Company Projects & Assigned Teams"
        subtitle="Track active company projects, assigned team members, deliverables, and timelines"
        actionButton={
          role === "admin" ? (
            <button
              onClick={() => addToast("Create Project", "Project creation wizard opened.", "info")}
              className="px-4 py-2 bg-[#4f45ba] hover:bg-[#4038a3] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="dayflow-card p-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F3FB] border border-[#ECEBF7] rounded-lg">
            {["All", "In Progress", "Completed", "Planning"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-[#4f45ba] shadow-xs"
                    : "text-[#8583A6] hover:text-[#2B2A45]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-56 ml-auto">
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
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            message="No company projects match your filter query."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((prj) => {
              const completedTasks = prj.tasks.filter((t) => t.status === "completed").length;

              return (
                <div
                  key={prj.id}
                  className="dayflow-card p-6 flex flex-col justify-between space-y-4 hover:border-[#4f45ba] transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] text-[#8583A6] block">{prj.id}</span>
                        <h3 className="text-base font-medium text-[#2B2A45] group-hover:text-[#4f45ba] transition-colors">
                          {prj.title}
                        </h3>
                      </div>
                      <StatusBadge
                        status={
                          prj.status === "In Progress"
                            ? "half-day"
                            : prj.status === "Completed"
                            ? "present"
                            : "on-leave"
                        }
                        label={prj.status}
                      />
                    </div>

                    <p className="text-xs text-[#8583A6] leading-relaxed line-clamp-2">
                      {prj.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8583A6]">Project Progress</span>
                      <span className="font-semibold text-[#2B2A45]">{prj.progress}%</span>
                    </div>
                    <div className="w-full bg-[#F4F3FB] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4f45ba] h-full rounded-full transition-all duration-500"
                        style={{ width: `${prj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details Footer: Manager, Assigned Team & Action */}
                  <div className="pt-4 border-t border-[#ECEBF7] flex items-center justify-between gap-3 text-xs">
                    {/* Team Avatars */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {prj.team.map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.role})`}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#8583A6] font-medium">
                        {prj.team.length} Team Members
                      </span>
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/projects/${prj.id}`}
                      className="px-3 py-1.5 bg-[#EEEDFE] hover:bg-[#4f45ba] text-[#4f45ba] hover:text-white rounded-lg font-medium transition-colors inline-flex items-center gap-1 shrink-0"
                    >
                      <span>View Team & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
