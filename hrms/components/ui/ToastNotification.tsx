import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let icon = <Info className="w-4 h-4 text-[#4f45ba]" />;
        let borderClass = "border-[#EEEDFE]";

        if (t.type === "success") {
          icon = <CheckCircle2 className="w-4 h-4 text-[#085041]" />;
          borderClass = "border-[#E1F5EE]";
        } else if (t.type === "danger") {
          icon = <AlertCircle className="w-4 h-4 text-[#791F1F]" />;
          borderClass = "border-[#FCEBEB]";
        } else if (t.type === "warning") {
          icon = <AlertCircle className="w-4 h-4 text-[#854F0B]" />;
          borderClass = "border-[#FAEEDA]";
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white border ${borderClass} shadow-lg rounded-xl p-3.5 flex items-start gap-3 transition-all animate-bounceIn`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-[#2B2A45]">{t.title}</h4>
              {t.message && <p className="text-[11px] text-[#8583A6] mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#9C9AB8] hover:text-[#2B2A45] text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
