"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Sparkles, X, Send, Bot, User, RefreshCw, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export const AIChatbotWidget: React.FC = () => {
  const { userProfile, leaveBalances, isCheckedIn, todayHours, role } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: `Hello ${userProfile.name}! 👋 I am your Dayflow AI HR Assistant. How can I help you with attendance, leaves, or payroll today?`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const generateAIResponse = (userText: string): string => {
    const q = userText.toLowerCase();

    if (q.includes("leave") || q.includes("vacation") || q.includes("sick")) {
      return `You currently have ${leaveBalances.paid} days of Paid Leave and ${leaveBalances.sick} days of Sick Leave remaining. You can apply for time off directly under the 'Leave' tab!`;
    }

    if (q.includes("check in") || q.includes("check out") || q.includes("attendance") || q.includes("shift")) {
      return isCheckedIn
        ? `You are currently checked in! You have logged ${todayHours} hours today so far. You can check out anytime on your dashboard.`
        : `You are currently checked out. Click the 'Check In' button on your dashboard to start tracking your workday.`;
    }

    if (q.includes("pay") || q.includes("salary") || q.includes("payslip") || q.includes("money")) {
      return `Your net takehome pay is scheduled for disbursement on August 31, 2026. You can view & download your full breakdown under the 'Payroll' tab.`;
    }

    if (q.includes("project") || q.includes("team") || q.includes("task")) {
      return `You can view all active company projects and assigned team members in the 'Projects' section from the left sidebar!`;
    }

    if (q.includes("hr") || q.includes("admin") || q.includes("policy")) {
      return `Dayflow HR policies require 8 hours daily target time. For special HR requests or policy clearances, please consult Courtney Henry (HR Lead).`;
    }

    return `I understand you are asking about "${userText}". As your Dayflow AI Assistant, I can help you check leave balances, attendance logs, payslips, or company project details. What would you like to view?`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = generateAIResponse(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#ECEBF7] shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-[#4f45ba] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Dayflow AI Assistant</h3>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Always Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 bg-[#F4F3FB] border-b border-[#ECEBF7] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {[
              "Check leave balance",
              "When is payday?",
              "Am I checked in?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 bg-white hover:bg-[#EEEDFE] hover:text-[#4f45ba] text-[#2B2A45] border border-[#ECEBF7] rounded-full whitespace-nowrap font-medium transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FDFDFE]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] text-[#4f45ba] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#4f45ba] text-white rounded-br-none"
                      : "bg-[#F4F3FB] text-[#2B2A45] border border-[#ECEBF7] rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] mt-1 block text-right font-normal ${
                      m.sender === "user" ? "text-white/70" : "text-[#9C9AB8]"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === "user" && (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#ECEBF7] mt-0.5"
                  />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#8583A6]">
                <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] text-[#4f45ba] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#F4F3FB] p-2.5 rounded-xl border border-[#ECEBF7] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f45ba] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f45ba] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f45ba] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-[#ECEBF7] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI HR Assistant..."
              className="flex-1 px-3 py-2 bg-[#F4F3FB] rounded-xl text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] border border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-[#4f45ba] hover:bg-[#4038a3] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#4f45ba] hover:bg-[#4038a3] active:bg-[#342d88] text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer relative group"
        title="Dayflow AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      </button>
    </div>
  );
};
