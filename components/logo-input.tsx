"use client";

import { useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;

/** File input for logo uploads with an inline too-big check (server re-validates). */
export function LogoInput({ id = "logo", name = "logo" }: { id?: string; name?: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && f.size > MAX_BYTES) {
            setError(`That file is ${(f.size / 1024 / 1024).toFixed(1)} MB — logos must be under 5 MB. Try exporting a smaller PNG.`);
            e.target.value = "";
          } else {
            setError(null);
          }
        }}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </>
  );
}
