"use client";

import Link from "next/link";

import { Separator } from "radix-ui";
import { api } from "~/trpc/react";

export function GamesList() {
  const { data: games, isLoading } = api.game.getMyGames.useQuery();

  if (isLoading) {
    return (
      <div>
        <div>Loading games...</div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div>
        <div>No games found.</div>
      </div>
    );
  }

  return (
    <ul role="list" aria-label="List of your games">
      {games.map((game, index) => {
        const isEnded = new Date() > game.endingTime;
        const isActive = !isEnded;

        return (
          <li key={game.id} role="listitem" className="pb-2">
            <Link
              href={`/game/${game.id}`}
              prefetch={true}
              className="group block w-full text-left"
              aria-label={`View game: ${game.title}, ${isActive ? "Active" : "Ended"}, ${game.isPublic ? "Public" : "Private"}, Admin: ${game.admin.username}, ${game._count.challenges} challenges, Ends: ${new Date(game.endingTime).toLocaleString()}`}
            >
              <div>
                <h3 className="inline group-hover:bg-[var(--white)] group-hover:text-[var(--dark-gray)]">
                  {game.title}
                  <span className="opacity-0 group-hover:opacity-100">
                    {" <-"}
                  </span>
                </h3>
                {game.description && (
                  <p className="mt-1 ml-2 text-sm text-[var(--light-gray)]">
                    {game.description}
                  </p>
                )}
              </div>
              <div className="ml-8">
                <p>
                  Status:{" "}
                  <span
                    className={`${
                      isActive
                        ? "bg-[var(--green)] text-[var(--dark-gray)]"
                        : "bg-[var(--yellow)] text-[var(--dark-gray)]"
                    }`}
                  >
                    {isActive ? "Active" : "Ended"}
                  </span>
                </p>
                <p>
                  Visibility:{" "}
                  <span
                    className={`${
                      game.isPublic
                        ? "bg-[var(--light-blue)] text-[var(--light-gray)]"
                        : "bg-[var(--dark-gray)] text-[var(--light-gray)]"
                    }`}
                  >
                    {game.isPublic ? "Public" : "Private"}
                  </span>
                </p>
                <p>
                  Admin:{" "}
                  <span style={{ color: "var(--yellow)" }}>
                    {game.admin.username}
                  </span>
                </p>
                <p>Challenges: {game._count.challenges}</p>
                <p>Ends: {new Date(game.endingTime).toLocaleString()}</p>
              </div>
            </Link>
            {index < games.length - 1 && <Separator.Root />}
          </li>
        );
      })}
    </ul>
  );
}
