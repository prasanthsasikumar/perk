import * as React from "react";

export function Label({ className = "", children, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-sm font-medium text-ink-soft ${className}`} {...rest}>
      {children}
    </label>
  );
}

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : hint ? <p className="text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}
