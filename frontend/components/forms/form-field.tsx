"use client";

import { cn } from "@/lib/utils/cn";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  className,
  required,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
