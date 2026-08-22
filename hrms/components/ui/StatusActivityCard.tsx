import React from "react";

interface StatusActivityCardProps {
  variant?: "purple" | "white";
  title: string;
  subtitle?: string;
  timestamp?: string;
  badgeText?: string;
  actionButtons?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const StatusActivityCard: React.FC<StatusActivityCardProps> = ({
  variant = "white",
  title,
  subtitle,
  timestamp,
  badgeText,
  actionButtons,
  children,
  className = "",
}) => {
  const isPurple = variant === "purple";
  const bgStyle = isPurple
    ? "bg-[#EEEDFE] border border-[#D8D6E9]"
    : "bg-white border border-[#ECEBF7]";

  return (
    <div className={`p-3.5 rounded-xl transition-all ${bgStyle} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium truncate ${isPurple ? "text-[#2B2A45]" : "text-[#2B2A45]"}`}>
              {title}
            </span>
            {badgeText && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4f45ba] text-white shrink-0">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-[11px] mt-0.5 truncate ${isPurple ? "text-[#4038a3]" : "text-[#8583A6]"}`}>
              {subtitle}
            </p>
          )}
          {timestamp && (
            <span className="text-[10px] text-[#9C9AB8] mt-1 block font-normal">
              {timestamp}
            </span>
          )}
        </div>
      </div>
      {children && <div className="mt-2 text-xs">{children}</div>}
      {actionButtons && <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center gap-2">{actionButtons}</div>}
    </div>
  );
};
