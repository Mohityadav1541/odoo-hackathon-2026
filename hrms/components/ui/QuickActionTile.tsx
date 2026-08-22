import React from "react";
import { LucideIcon } from "lucide-react";

interface QuickActionTileProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  badgeCount?: number;
}

export const QuickActionTile: React.FC<QuickActionTileProps> = ({
  label,
  icon: Icon,
  onClick,
  badgeCount,
}) => {
  return (
    <button
      onClick={onClick}
      className="dayflow-card p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#4f45ba] hover:bg-[#FDFDFE] transition-all group relative"
    >
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-2 right-2 bg-[#4f45ba] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
          {badgeCount}
        </span>
      )}
      <div className="w-11 h-11 rounded-xl bg-[#EEEDFE] flex items-center justify-center text-[#4f45ba] mb-2.5 group-hover:scale-105 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-[#2B2A45] group-hover:text-[#4f45ba] transition-colors">
        {label}
      </span>
    </button>
  );
};
