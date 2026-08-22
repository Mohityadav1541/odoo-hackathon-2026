"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, User, CheckCircle2, ArrowRight } from "lucide-react";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { useApp } from "@/context/AppContext";

export default function SignUpPage() {
  const router = useRouter();
  const { addToast, setRole, signup } = useApp();

  const [formData, setFormData] = useState({
    employeeId: "EMP001",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedRole: "employee" as "employee" | "admin",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Work email is required";
    else if (!formData.email.includes("@")) newErrors.email = "Enter a valid email address";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const success = await signup(
      formData.employeeId,
      formData.email,
      formData.password,
      formData.selectedRole
    );
    
    setIsLoading(false);

    if (success) {
      setRole(formData.selectedRole);
      router.push("/auth/signin");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F4F3FB] font-sans antialiased text-[#2B2A45]">
      {/* Left Brand Panel */}
      <div className="w-full md:w-1/2 bg-[#4f45ba] p-8 md:p-14 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 top-1/3 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-wide">Dayflow</span>
        </div>

        {/* Hero Tagline */}
        <div className="my-12 z-10 max-w-md space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hackathon HRMS Edition
          </span>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight text-white">
            Every workday, <br />
            perfectly aligned.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Automate attendance tracking, leave requests, payroll processing, and team insights with standard Odoo backend compatibility.
          </p>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-white/60">
          © 2026 Dayflow HRMS • Secure Enterprise Portal
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md dayflow-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-[#2B2A45]">Create your account</h2>
            <p className="text-xs text-[#8583A6] mt-1">Get started with Dayflow HRMS in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector Segmented Control */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2B2A45]">Register As</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F3FB] rounded-lg border border-[#ECEBF7]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedRole: "employee" })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    formData.selectedRole === "employee"
                      ? "bg-white text-[#4f45ba] shadow-xs"
                      : "text-[#8583A6] hover:text-[#2B2A45]"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedRole: "admin" })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    formData.selectedRole === "admin"
                      ? "bg-white text-[#4f45ba] shadow-xs"
                      : "text-[#8583A6] hover:text-[#2B2A45]"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin / HR
                </button>
              </div>
            </div>

            {/* Employee ID */}
            <FormFieldSet label="Employee ID" hint="Required">
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:border-[#4f45ba] focus:outline-none"
              />
            </FormFieldSet>

            {/* Full Name */}
            <FormFieldSet label="Full Name" required error={errors.fullName}>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Work Email */}
            <FormFieldSet label="Work Email Address" required error={errors.email}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex.morgan@company.hr"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Password */}
            <FormFieldSet label="Password" required error={errors.password}>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Confirm Password */}
            <FormFieldSet label="Confirm Password" required error={errors.confirmPassword}>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#4f45ba] hover:bg-[#4038a3] active:bg-[#4E43BE] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-[#ECEBF7] text-center text-xs text-[#8583A6]">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#4f45ba] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
