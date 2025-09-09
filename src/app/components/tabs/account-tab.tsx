"use client";

import { api } from "~/trpc/react";
import UsernameSetup from "~/app/components/username-setup";

export function AccountTab() {
  const { data: stats, isLoading: statsLoading } =
    api.account.getStats.useQuery();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2>Account Statistics</h2>
        {statsLoading ? (
          <div>Loading statistics...</div>
        ) : (
          <table className="mx-auto text-center">
            <thead>
              <tr>
                <th className="px-4 text-center">Games Hosted</th>
                <th className="px-4 text-center">Games Played</th>
                <th className="px-4 text-center">First Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 text-center">
                  {stats?.totalGamesHosted ?? 0}
                </td>
                <td className="px-4 text-center">
                  {stats?.totalGamesPlayed ?? 0}
                </td>
                <td className="px-4 text-center">
                  {stats?.firstJoined
                    ? new Date(stats.firstJoined).toLocaleDateString()
                    : "Never"}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="space-y-4">
        <h2>Change Username</h2>
        <UsernameSetup buttonText="Update Username" />
      </div>
    </div>
  );
}
