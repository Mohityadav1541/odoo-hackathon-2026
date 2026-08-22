"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ArrowLeft,
  Calendar,
  Building,
  DollarSign,
  CheckCircle2,
  Clock,
  ListTodo,
  Users,
  UserCheck,
} from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, addToast } = useApp();

  const [suggestion, setSuggestion] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [suggestionsList, setSuggestionsList] = useState<{author: string, text: string, date: string, fileName?: string}[]>([
    { author: "Devon Lane", text: "We should consider updating the backend schema before finalizing the UI.", date: "Aug 20, 2026" }
  ]);

  const handleAddSuggestion = () => {
    if (!suggestion.trim() && !attachedFile) return;
    setSuggestionsList(prev => [{ 
      author: "You", 
      text: suggestion, 
      date: "Just now",
      fileName: attachedFile ? attachedFile.name : undefined
    }, ...prev]);
    setSuggestion("");
    setAttachedFile(null);
    addToast("Suggestion Added", "Your project suggestion has been recorded.", "success");
  };

  const project = projects.find((p) => p.id === id) || projects[0];

  const completedCount = project.tasks.filter((t) => t.status === "completed").length;

  return (
    <AppShell>
      {/* Back Button & Header */}
      <div className="mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-[#8583A6] hover:text-[#4f45ba] font-medium transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Projects
        </Link>
        <GreetingHeader
          name={project.title}
          subtitle={`Project ID: ${project.id} • ${project.department} Department`}
        />
      </div>

      <div className="space-y-6">
        {/* Top Summary Card */}
        <div className="dayflow-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="section-label">PROJECT DESCRIPTION</span>
              <p className="text-xs text-[#2B2A45] mt-1 leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>
            <StatusBadge
              status={
                project.status === "In Progress"
                  ? "half-day"
                  : project.status === "Completed"
                  ? "present"
                  : "on-leave"
              }
              label={project.status}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#ECEBF7] text-xs">
            <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
              <span className="text-[#8583A6] block text-[11px]">Project Manager</span>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={project.managerAvatar}
                  alt={project.manager}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-semibold text-[#2B2A45]">{project.manager}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
              <span className="text-[#8583A6] block text-[11px]">Deadline</span>
              <span className="font-semibold text-[#2B2A45] mt-1 block">{project.deadline}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
              <span className="text-[#8583A6] block text-[11px]">Budget Allocation</span>
              <span className="font-semibold text-[#085041] mt-1 block">{project.budget}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EEEDFE] border border-[#D8D6E9]">
              <span className="text-[#4f45ba] font-semibold block text-[11px]">Progress</span>
              <span className="font-semibold text-[#4f45ba] mt-1 block">{project.progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Assigned Team Roster Card */}
        <div className="dayflow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Assigned Team Members</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Staff assigned to deliver project milestones
              </p>
            </div>
            <span className="text-xs font-semibold text-[#4f45ba] bg-[#EEEDFE] px-2.5 py-1 rounded-full">
              {project.team.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.team.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-[#ECEBF7] bg-white flex items-center gap-3.5 hover:border-[#4f45ba] transition-colors"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#ECEBF7]"
                />
                <div>
                  <h4 className="text-xs font-semibold text-[#2B2A45]">{member.name}</h4>
                  <p className="text-[11px] text-[#8583A6]">{member.role}</p>
                  <span className="text-[10px] font-mono text-[#9C9AB8]">{member.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables & Task List Card */}
        <div className="dayflow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Project Deliverables & Tasks</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                {completedCount} of {project.tasks.length} tasks completed
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {project.tasks.map((task: any, idx: number) => (
              <div
                key={task.id || idx}
                className="p-3.5 rounded-xl border border-[#ECEBF7] bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      task.status === "completed"
                        ? "bg-[#E1F5EE] text-[#085041]"
                        : task.status === "in-progress"
                        ? "bg-[#FAEEDA] text-[#854F0B]"
                        : "bg-[#F4F3FB] text-[#8583A6]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-[#2B2A45]">{task.title}</span>
                    <span className="text-[11px] text-[#8583A6] block">
                      Assigned to: {task.assignedTo}
                    </span>
                  </div>
                </div>

                <StatusBadge
                  status={
                    task.status === "completed"
                      ? "present"
                      : task.status === "in-progress"
                      ? "half-day"
                      : "neutral"
                  }
                  label={task.status}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Project Suggestions & Documents */}
        <div className="dayflow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#2B2A45]">Project Suggestions & Documents</h3>
              <p className="text-xs text-[#8583A6] mt-0.5">
                Share ideas or upload documents related to this project
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Type your suggestion..."
                className="flex-1 w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
              <div className="relative shrink-0">
                <input
                  type="file"
                  id="suggestionFile"
                  className="sr-only"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="suggestionFile"
                  className="px-3 py-2 bg-[#F4F3FB] hover:bg-[#EEEDFE] text-[#4f45ba] rounded-lg text-xs font-medium transition-colors border border-[#ECEBF7] hover:border-[#4f45ba] cursor-pointer inline-flex items-center justify-center min-w-[120px] text-center"
                >
                  {attachedFile ? attachedFile.name.substring(0, 15) + (attachedFile.name.length > 15 ? '...' : '') : "Attach Document"}
                </label>
              </div>
              <button
                onClick={handleAddSuggestion}
                className="px-4 py-2 bg-[#4f45ba] hover:bg-[#4038a3] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap w-full sm:w-auto"
              >
                Submit Suggestion
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {suggestionsList.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[#ECEBF7] bg-[#F4F3FB] flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2B2A45]">{s.author}</span>
                    <span className="text-[#8583A6] text-[11px]">{s.date}</span>
                  </div>
                  {s.text && <p className="text-[#2B2A45] leading-relaxed mt-1">{s.text}</p>}
                  {s.fileName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#ECEBF7] rounded-md max-w-fit">
                      <svg className="w-3.5 h-3.5 text-[#4f45ba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-[#4f45ba] font-medium text-[11px]">{s.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
