"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/input";

const OPTIONS = [
  ["", "All events"],
  ["stamp", "Stamps"],
  ["reward_earned", "Rewards earned"],
  ["redeem", "Redemptions"],
  ["adjust", "Adjustments"],
  ["card_created", "New cards"],
] as const;

/** Event-type filter for the activity ledger; applies as soon as a value is picked. */
export function TypeFilter({ value }: { value: string }) {
  const router = useRouter();
  return (
    <form className="w-full sm:w-56" onSubmit={(e) => e.preventDefault()}>
      <Select
        name="type"
        value={value}
        aria-label="Filter by type"
        onChange={(e) => router.push(e.target.value ? `/dashboard/activity?type=${e.target.value}` : "/dashboard/activity")}
      >
        {OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </Select>
    </form>
  );
}
