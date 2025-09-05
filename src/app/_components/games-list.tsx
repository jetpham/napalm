"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export function GamesList() {
  const router = useRouter();
  const { data: games, isLoading } = api.game.getAll.useQuery();

  if (isLoading) {
    return (
      <div>
        <h2>All Games</h2>
        <div>Loading games...</div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div>
        <h2>All Games</h2>
        <div>No games found.</div>
      </div>
    );
  }

  return (
    <div>
      <h2>All Games</h2>
      <div>
        {games.map((game) => {
          const isEnded = new Date() > game.endingTime;
          const isActive = !isEnded;

          return (
            <div
              key={game.id}
              onClick={() => router.push(`/game/${game.id}`)}
            >
              <div>
                <h3>{game.title}</h3>
                <span>
                  {isActive ? "Active" : "Ended"}
                </span>
              </div>
              <p>
                Admin: {game.admin.name || game.admin.email}
              </p>
              <p>
                Challenges: {game._count.challenges}
              </p>
              <p>
                Ends: {new Date(game.endingTime).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
