import React from "react";

interface GreetingHeaderProps {
  name: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  name,
  subtitle,
  actionButton,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div>
        <h1 className="text-[22px] font-medium text-[#2B2A45] tracking-tight">
          Hello, {name}!
        </h1>
        <p className="text-xs text-[#8583A6] mt-0.5 font-normal">{subtitle}</p>
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};
