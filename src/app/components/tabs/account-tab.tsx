"use client";

import UsernameSetup from "~/app/components/username-setup";

export function AccountTab() {
  return (
    <div className="space-y-4">
      <div className="flex min-h-[50vh] justify-center">
        <UsernameSetup />
      </div>
    </div>
  );
}
