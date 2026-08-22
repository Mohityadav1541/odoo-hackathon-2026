"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function VerifyEmailPage() {
  const { addToast } = useApp();
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      addToast("Verification link sent", "Please check your inbox & spam folder.", "info");
    }, 800);
  };

  const handleSimulateVerify = () => {
    setIsVerified(true);
    addToast("Email Verified!", "Your account is active.", "success");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F3FB] p-4 font-sans text-[#2B2A45]">
      <div className="w-full max-w-md dayflow-card p-8 text-center shadow-sm">
        {/* Status Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#4f45ba] mb-4">
          {isVerified ? (
            <CheckCircle2 className="w-8 h-8 text-[#085041]" />
          ) : (
            <Mail className="w-8 h-8" />
          )}
        </div>

        <h2 className="text-xl font-medium text-[#2B2A45]">
          {isVerified ? "Email verified successfully!" : "Verify your email address"}
        </h2>

        <p className="text-xs text-[#8583A6] mt-2 leading-relaxed max-w-xs mx-auto">
          {isVerified
            ? "Your work email address has been verified. You can now access your Dayflow HRMS workspace."
            : "We have sent a verification link to your email. Click the link in the email to activate your account."}
        </p>

        {!isVerified ? (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSimulateVerify}
              className="w-full py-2.5 px-4 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Simulate Click Email Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-2 px-4 bg-[#EEEDFE] hover:bg-[#D8D6E9] text-[#4f45ba] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isResending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Resend Verification Email</span>
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-[#4f45ba] hover:bg-[#4038a3] text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Proceed to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#ECEBF7] text-xs text-[#8583A6]">
          Need help? Contact your company HR administrator.
        </div>
      </div>
    </div>
  );
}
