"use client";

import { useRouter } from "next/navigation";

import { Separator } from "radix-ui";
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
    <section>
      <h2>All Games</h2>
      <ul role="list" aria-label="List of all games">
        {games.map((game, index) => {
          const isEnded = new Date() > game.endingTime;
          const isActive = !isEnded;

          return (
            <li key={game.id} role="listitem">
              <button
                onClick={() => router.push(`/game/${game.id}`)}
                type="button"
                className="w-full text-left"
                aria-label={`View game: ${game.title}, ${isActive ? "Active" : "Ended"}, Admin: ${game.admin.name || game.admin.email}, ${game._count.challenges} challenges, Ends: ${new Date(game.endingTime).toLocaleString()}`}
              >
                <div>
                  <h3>{game.title}</h3>
                  <span aria-label={`Game status: ${isActive ? "Active" : "Ended"}`}>
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
              </button>
              {index < games.length - 1 && <Separator.Root />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
