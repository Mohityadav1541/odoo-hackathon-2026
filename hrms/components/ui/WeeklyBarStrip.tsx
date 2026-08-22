import React from "react";
import { AttendanceDay } from "@/context/AppContext";

interface WeeklyBarStripProps {
  days: AttendanceDay[];
}

export const WeeklyBarStrip: React.FC<WeeklyBarStripProps> = ({ days }) => {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 px-1">
        {days.map((item, idx) => {
          let barHeight = "h-0";
          let barColor = "bg-[#E2E1F0]"; // default/weekend
          let titleText = `${item.day}: Weekend`;

          if (item.status === "present") {
            barHeight = item.hoursWorked ? `${Math.min(100, (item.hoursWorked / 9) * 100)}%` : "85%";
            barColor = "bg-[#4f45ba]";
            titleText = `${item.day}: Present (${item.hoursWorked || 8} hrs)`;
          } else if (item.status === "half-day") {
            barHeight = item.hoursWorked ? `${Math.min(100, (item.hoursWorked / 9) * 100)}%` : "45%";
            barColor = "bg-[#F0997B]";
            titleText = `${item.day}: Half-day (${item.hoursWorked || 4} hrs)`;
          } else if (item.status === "absent") {
            barHeight = "15%";
            barColor = "bg-[#FCEBEB]";
            titleText = `${item.day}: Absent`;
          }

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
              title={titleText}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 hidden group-hover:flex bg-[#2B2A45] text-white text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                {titleText}
              </div>

              {/* Vertical Bar */}
              <div className="w-full bg-[#F4F3FB] rounded-md h-full flex items-end p-0.5 overflow-hidden">
                <div
                  className={`w-full rounded-sm transition-all duration-500 ease-out ${barColor}`}
                  style={{ height: barHeight }}
                />
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-medium text-[#8583A6] mt-2 group-hover:text-[#4f45ba]">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-[#8583A6]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#4f45ba]" /> Present
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F0997B]" /> Half-Day
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E1F0]" /> Off / Weekend
        </div>
      </div>
    </div>
  );
};
