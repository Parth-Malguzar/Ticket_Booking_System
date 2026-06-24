import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-(--app-muted)">
        {label}
      </span>
      <input
        className={`w-full rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-fg) outline-none transition-all focus:border-(--app-accent) focus:ring-1 focus:ring-(--app-accent) ${className}`}
        {...props}
      />
    </label>
  );
};
