"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return <Button onClick={() => window.print()}>Print</Button>;
}
