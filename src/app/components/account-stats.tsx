import { api } from "~/trpc/server";

export async function AccountStats() {
  // Fetch data server-side
  const stats = await api.account.getStats();

  return (
    <div className="space-y-4">
      <h2>Account Statistics</h2>
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
            <td className="px-4 text-center">{stats?.totalGamesHosted ?? 0}</td>
            <td className="px-4 text-center">{stats?.totalGamesPlayed ?? 0}</td>
            <td className="px-4 text-center">
              {stats?.firstJoined
                ? new Date(stats.firstJoined).toLocaleDateString()
                : "Never"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
