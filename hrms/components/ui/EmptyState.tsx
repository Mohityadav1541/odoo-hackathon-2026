import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  message = "There are no entries matching your filter criteria.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-[#ECEBF7] my-4">
      <div className="w-12 h-12 rounded-full bg-[#F4F3FB] flex items-center justify-center text-[#8583A6] mb-3">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-[#2B2A45]">{title}</h3>
      <p className="text-xs text-[#8583A6] mt-1 max-w-sm">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 bg-[#EEEDFE] hover:bg-[#4f45ba] hover:text-white text-[#4f45ba] text-xs font-medium rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
