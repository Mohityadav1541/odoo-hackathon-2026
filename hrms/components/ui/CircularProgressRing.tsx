import React from "react";

interface CircularProgressRingProps {
  currentHours: number;
  totalHours?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  isCheckedIn?: boolean;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  currentHours,
  totalHours = 8,
  size = 180,
  strokeWidth = 12,
  label,
  sublabel,
  isCheckedIn = true,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min(100, Math.max(0, (currentHours / totalHours) * 100));
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const hoursInt = Math.floor(currentHours);
  const minutes = Math.round((currentHours - hoursInt) * 60);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E9E7FA"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress bar */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#4f45ba"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <div className="text-2xl font-semibold text-[#2B2A45] tracking-tight">
          {hoursInt}h {minutes > 0 ? `${minutes}m` : "00m"}
        </div>
        <div className="text-xs text-[#8583A6] mt-0.5 font-medium">
          {sublabel || `of ${totalHours} hrs target`}
        </div>
        {isCheckedIn && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#085041] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#085041] animate-pulse" />
            Active
          </div>
        )}
      </div>
    </div>
  );
};
