"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/layout/GreetingHeader";
import { ModalDrawer } from "@/components/ui/ModalDrawer";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Download,
  Edit3,
  Camera,
  Shield,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { userProfile, updateUserProfile, role } = useApp();
  const [activeTab, setActiveTab] = useState<"personal" | "job" | "salary" | "documents">("personal");

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    role: userProfile.role,
    department: userProfile.department,
    email: userProfile.email,
    phone: userProfile.phone,
    avatar: userProfile.avatar,
  });

  const handleOpenEdit = () => {
    setEditForm({
      name: userProfile.name,
      role: userProfile.role,
      department: userProfile.department,
      email: userProfile.email,
      phone: userProfile.phone,
      avatar: userProfile.avatar,
    });
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(editForm);
    setIsEditOpen(false);
  };

  return (
    <AppShell>
      {/* Greeting Header with Edit Profile Button */}
      <GreetingHeader
        name={userProfile.name}
        subtitle="Manage employee profile credentials and details"
        actionButton={
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 border border-[#4f45ba] text-[#4f45ba] hover:bg-[#EEEDFE] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Summary Card */}
        <div className="dayflow-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer" onClick={handleOpenEdit}>
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#4f45ba] p-0.5 shadow-sm"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">Change</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium text-[#2B2A45]">{userProfile.name}</h2>
            <p className="text-xs text-[#8583A6] mt-0.5 font-normal">{userProfile.role}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEDFE] text-[#4f45ba]">
              {userProfile.department}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-[#ECEBF7] space-y-2.5 text-left text-xs">
            <div className="flex items-center justify-between text-[#8583A6]">
              <span>Employee ID:</span>
              <span className="font-mono text-[#2B2A45] font-medium">{userProfile.id}</span>
            </div>
            <div className="flex items-center justify-between text-[#8583A6]">
              <span>Employment Type:</span>
              <span className="text-[#2B2A45] font-medium">Full-Time</span>
            </div>
            <div className="flex items-center justify-between text-[#8583A6]">
              <span>Joined Date:</span>
              <span className="text-[#2B2A45] font-medium">Jan 15, 2024</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Sections Card */}
        <div className="lg:col-span-2 dayflow-card flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-2 bg-[#FDFDFE] border-b border-[#ECEBF7]">
            {[
              { id: "personal", label: "Personal Details", icon: User },
              { id: "job", label: "Job Details", icon: Building },
              { id: "salary", label: "Salary Structure", icon: CreditCard },
              { id: "documents", label: "Documents", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#EEEDFE] text-[#4f45ba]"
                      : "text-[#8583A6] hover:text-[#2B2A45] hover:bg-[#F4F3FB]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1 space-y-6">
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#2B2A45]">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7] space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#8583A6]">
                      <Mail className="w-3.5 h-3.5 text-[#4f45ba]" /> Work Email
                    </div>
                    <div className="text-xs font-medium text-[#2B2A45]">{userProfile.email}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7] space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#8583A6]">
                      <Phone className="w-3.5 h-3.5 text-[#4f45ba]" /> Phone Number
                    </div>
                    <div className="text-xs font-medium text-[#2B2A45]">{userProfile.phone}</div>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-[#2B2A45] pt-2">Emergency Contact</h3>
                <div className="p-3.5 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7] text-xs space-y-1">
                  <div className="font-medium text-[#2B2A45]">Sarah Morgan (Spouse)</div>
                  <div className="text-[#8583A6]">+1 (555) 987-6543 • Primary Emergency Contact</div>
                </div>
              </div>
            )}

            {activeTab === "job" && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#2B2A45]">Position & Department</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[#8583A6] block mb-1">Job Title</span>
                    <span className="font-medium text-[#2B2A45]">{userProfile.role}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[#8583A6] block mb-1">Department</span>
                    <span className="font-medium text-[#2B2A45]">{userProfile.department}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[#8583A6] block mb-1">Direct Manager</span>
                    <span className="font-medium text-[#2B2A45]">Courtney Henry (HR Lead)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[#8583A6] block mb-1">Work Location</span>
                    <span className="font-medium text-[#2B2A45]">Headquarters - San Francisco</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "salary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[#2B2A45]">Monthly Salary Structure</h3>
                  <span className="text-xs text-[#085041] bg-[#E1F5EE] px-2.5 py-0.5 rounded-full font-medium">
                    Verified Structure
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[11px] text-[#8583A6] block">Basic Pay</span>
                    <span className="text-base font-semibold text-[#2B2A45] mt-1 block">
                      ${userProfile.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[11px] text-[#8583A6] block">HRA</span>
                    <span className="text-base font-semibold text-[#2B2A45] mt-1 block">
                      ${userProfile.hra.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F4F3FB] border border-[#ECEBF7]">
                    <span className="text-[11px] text-[#8583A6] block">Allowances</span>
                    <span className="text-base font-semibold text-[#2B2A45] mt-1 block">
                      ${userProfile.allowances.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EEEDFE] border border-[#D8D6E9]">
                    <span className="text-[11px] text-[#4f45ba] font-semibold block">Net Takehome</span>
                    <span className="text-base font-semibold text-[#4f45ba] mt-1 block">
                      ${(userProfile.basicSalary + userProfile.hra + userProfile.allowances - userProfile.deductions).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#2B2A45]">Verified Employee Documents</h3>
                <div className="space-y-2">
                  {[
                    { name: "Employment_Contract_2026.pdf", size: "1.2 MB", date: "Jan 15, 2024" },
                    { name: "Tax_Form_W2_2025.pdf", size: "850 KB", date: "Jan 30, 2026" },
                    { name: "Identity_Passport_Copy.pdf", size: "2.4 MB", date: "Jan 15, 2024" },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[#ECEBF7] hover:border-[#4f45ba] bg-white flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] text-[#4f45ba] flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[#2B2A45]">{doc.name}</div>
                          <div className="text-[11px] text-[#8583A6]">
                            {doc.size} • Uploaded {doc.date}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${doc.name}`)}
                        className="p-1.5 text-[#4f45ba] hover:bg-[#EEEDFE] rounded-lg transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ModalDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
        subtitle={role === "admin" ? "Admin mode: All fields unlocked" : "Update phone, email & avatar"}
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <FormFieldSet label="Full Name">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              disabled={role !== "admin"}
              className="w-full px-3.5 py-2.5 bg-white disabled:bg-[#F4F3FB] rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            />
          </FormFieldSet>

          <FormFieldSet label="Phone Number" required>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            />
          </FormFieldSet>

          <FormFieldSet label="Avatar Image URL">
            <input
              type="text"
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba]"
            />
          </FormFieldSet>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ECEBF7]">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-[#ECEBF7] text-[#8583A6] hover:bg-[#F4F3FB] rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4f45ba] hover:bg-[#4038a3] text-white rounded-lg text-xs font-medium"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </ModalDrawer>
    </AppShell>
  );
}
