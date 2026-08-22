"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { X, CheckCheck, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markAllNotificationsRead, role } = useApp();

  const filteredNotifications = notifications.filter(
    (n) => !n.targetRole || n.targetRole === "all" || n.targetRole === role
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-[#ECEBF7] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#ECEBF7] flex items-center justify-between bg-[#FDFDFE]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-[#2B2A45]">Notifications</h2>
              <span className="bg-[#EEEDFE] text-[#4f45ba] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {filteredNotifications.filter((n) => n.isUnread).length} new
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-[#4f45ba] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="text-[#8583A6] hover:text-[#2B2A45] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8583A6]">
                No notifications right now.
              </div>
            ) : (
              filteredNotifications.map((n) => {
                let icon = <Info className="w-4 h-4 text-[#4f45ba]" />;
                if (n.type === "success") icon = <CheckCircle2 className="w-4 h-4 text-[#085041]" />;
                if (n.type === "danger" || n.type === "warning")
                  icon = <AlertCircle className="w-4 h-4 text-[#854F0B]" />;

                const content = (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.link) {
                        onClose(); // Close panel when navigating
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all ${n.link ? "cursor-pointer hover:border-[#4f45ba]" : ""} ${
                      n.isUnread
                        ? "bg-[#EEEDFE]/40 border-[#D8D6E9]"
                        : "bg-white border-[#ECEBF7]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-[#2B2A45] truncate">
                            {n.title}
                          </h4>
                          {n.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#4f45ba] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#8583A6] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-[#9C9AB8] mt-1.5 block">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
                
                return n.link ? (
                  <a href={n.link} key={n.id} className="block">
                    {content}
                  </a>
                ) : content;
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
