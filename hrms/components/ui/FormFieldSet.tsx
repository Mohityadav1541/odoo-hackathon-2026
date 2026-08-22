import React from "react";

interface FormFieldSetProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormFieldSet: React.FC<FormFieldSetProps> = ({
  label,
  error,
  required,
  hint,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#2B2A45]">
          {label}
          {required && <span className="text-[#791F1F] ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#9C9AB8]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-[11px] font-medium text-[#791F1F] flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-[#791F1F]" />
          {error}
        </p>
      )}
    </div>
  );
};
