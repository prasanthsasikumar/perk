"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/print", label: "Print" },
];

export function DashNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-6">
      {ITEMS.map((it) => {
        const active = it.href === "/dashboard" ? path === "/dashboard" : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium lg:rounded-xl ${active ? "bg-ink text-cream" : "text-ink-soft hover:bg-black/5 hover:text-ink"}`}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
