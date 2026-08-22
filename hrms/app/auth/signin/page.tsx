"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormFieldSet } from "@/components/ui/FormFieldSet";
import { useApp } from "@/context/AppContext";

export default function SignInPage() {
  const router = useRouter();
  const { setRole, addToast, login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorBanner("Please fill in both Employee ID/Email and password.");
      return;
    }

    setErrorBanner(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      setIsLoading(false);
      
      if (success) {
        router.push("/");
      }
    } catch (error: any) {
      setIsLoading(false);
      setErrorBanner(error.message || "Invalid credentials");
    }
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
            <FormFieldSet label="Employee ID (or Email)">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMP001"
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

            {/* Checkbox */}
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

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#ECEBF7]"></div>
              <span className="flex-shrink-0 mx-4 text-[#8583A6] text-xs">or</span>
              <div className="flex-grow border-t border-[#ECEBF7]"></div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = "http://localhost:3000/auth/google"}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F4F3FB] border border-[#ECEBF7] text-[#2B2A45] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign In with Google
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
