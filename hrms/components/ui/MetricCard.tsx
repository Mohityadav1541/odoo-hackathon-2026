import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "neutral" | "purple";
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  badge,
  className = "",
}) => {
  let badgeStyle = "bg-[#F4F3FB] text-[#8583A6]";
  if (badge?.variant === "success") badgeStyle = "bg-[#E1F5EE] text-[#085041]";
  if (badge?.variant === "warning") badgeStyle = "bg-[#FAEEDA] text-[#854F0B]";
  if (badge?.variant === "danger") badgeStyle = "bg-[#FCEBEB] text-[#791F1F]";
  if (badge?.variant === "purple") badgeStyle = "bg-[#EEEDFE] text-[#4f45ba]";

  return (
    <div className={`dayflow-card p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="section-label">{label}</span>
          <div className="text-2xl font-medium text-[#2B2A45] mt-1.5">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#EEEDFE] flex items-center justify-center text-[#4f45ba] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtext || badge) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#ECEBF7] text-xs">
          {subtext && <span className="text-[#8583A6] font-normal">{subtext}</span>}
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeStyle}`}>
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
