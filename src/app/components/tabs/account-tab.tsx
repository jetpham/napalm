import { Suspense } from "react";
import { AccountStats } from "~/app/components/account-stats";
import UsernameSetup from "~/app/components/username-setup";

function AccountStatsFallback() {
  return (
    <div className="space-y-4">
      <h2>Account Statistics</h2>
      <div>Loading statistics...</div>
    </div>
  );
}

export function AccountTab() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<AccountStatsFallback />}>
        <AccountStats />
      </Suspense>

      <div className="space-y-4">
        <h2>Change Username</h2>
        <UsernameSetup buttonText="Update Username" />
      </div>
    </div>
  );
}
