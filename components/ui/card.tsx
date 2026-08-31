import * as React from "react";

export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card border border-line bg-paper p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-base font-semibold text-ink ${className}`}>{children}</h2>;
}
