import React from "react";

export type StatusVariant =
  | "present"
  | "approved"
  | "success"
  | "pending"
  | "half-day"
  | "warning"
  | "absent"
  | "rejected"
  | "danger"
  | "on-leave"
  | "neutral"
  | "weekend"
  | "Paid";

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = "" }) => {
  const normalized = (status || "").toLowerCase();
  
  let bgClass = "bg-[#F4F3FB] text-[#8583A6]"; // neutral
  let text = label || status;

  if (["present", "approved", "success", "paid"].includes(normalized)) {
    bgClass = "bg-[#E1F5EE] text-[#085041]";
    text = label || (normalized === "paid" ? "Paid" : normalized === "present" ? "Present" : "Approved");
  } else if (["pending", "half-day", "warning"].includes(normalized)) {
    bgClass = "bg-[#FAEEDA] text-[#854F0B]";
    text = label || (normalized === "half-day" ? "Half Day" : "Pending");
  } else if (["absent", "rejected", "danger"].includes(normalized)) {
    bgClass = "bg-[#FCEBEB] text-[#791F1F]";
    text = label || (normalized === "absent" ? "Absent" : "Rejected");
  } else if (["on-leave"].includes(normalized)) {
    bgClass = "bg-[#EEEDFE] text-[#4f45ba]";
    text = label || "On Leave";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide leading-relaxed ${bgClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      <span className="capitalize">{text}</span>
    </span>
  );
};
