import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className = "", invalid, ...rest }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-xl border bg-paper px-3.5 text-[15px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 ${invalid ? "border-danger" : "border-line"} ${className}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({ className = "", ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`h-11 w-full rounded-xl border border-line bg-paper px-3 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`} {...rest}>
      {children}
    </select>
  );
}
