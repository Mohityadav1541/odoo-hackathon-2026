"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { useApp } from "@/context/AppContext";

export default function SignInPage() {
  const router = useRouter();
  const { role, setRole, addToast, employees, setUserProfile } = useApp();

  const [email, setEmail] = useState("alex.morgan@dayflow.hr");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<"employee" | "admin">("employee");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorBanner("Please fill in both email and password.");
      return;
    }

    setErrorBanner(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Auto detect HR vs Employee from email credential
      const isHr = email.toLowerCase().includes("courtney") || email.toLowerCase().includes("admin") || email.toLowerCase().includes("hr");
      const targetRole = isHr ? "admin" : "employee";
      
      let match = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (!match) {
        match = isHr ? (employees.find(e => e.role.toLowerCase().includes("hr")) || employees[0]) : employees[0];
      }
      
      setUserProfile(match);
      setRole(targetRole);
      addToast(
        "Signed in successfully",
        `Welcome back to Dayflow ${targetRole === "admin" ? "Admin / HR" : "Employee"} Workspace!`,
        "success"
      );
      router.push(targetRole === "admin" ? "/admin" : "/");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F4F3FB] font-sans antialiased text-[#2B2A45]">
      {/* Left Brand Panel */}
      <div className="w-full md:w-1/2 bg-[#4f45ba] p-8 md:p-14 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />

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
            Welcome back to <br />
            your workspace.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Manage attendance, review leave applications, download payslips, and analyze team productivity seamlessly.
          </p>
        </div>

        <div className="z-10 text-xs text-white/60">
          © 2026 Dayflow HRMS • Odoo Engine Integration
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md dayflow-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-[#2B2A45]">Sign in to Dayflow</h2>
            <p className="text-xs text-[#8583A6] mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="mb-4 p-3 bg-[#FCEBEB] border border-[#FCEBEB] rounded-lg text-xs text-[#791F1F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Email Field */}
            <FormFieldSet label="Work Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.hr"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Password Field */}
            <FormFieldSet label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE] transition-all"
              />
            </FormFieldSet>

            {/* Checkbox + Forgot password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#8583A6]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#ECEBF7] text-[#4f45ba] focus:ring-[#4f45ba]"
                />
                Remember me
              </label>
              <a href="#" className="text-[#4f45ba] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-[#ECEBF7] text-center text-xs text-[#8583A6]">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-[#4f45ba] font-medium hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
