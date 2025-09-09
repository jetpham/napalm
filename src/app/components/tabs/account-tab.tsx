"use client";

import { api } from "~/trpc/react";
import UsernameSetup from "~/app/components/username-setup";

export function AccountTab() {
  const { data: stats, isLoading: statsLoading } = api.account.getStats.useQuery();

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
                <th className="text-center px-4">Games Hosted</th>
                <th className="text-center px-4">Games Played</th>
                <th className="text-center px-4">First Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center px-4">{stats?.totalGamesHosted ?? 0}</td>
                <td className="text-center px-4">{stats?.totalGamesPlayed ?? 0}</td>
                <td className="text-center px-4">
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
