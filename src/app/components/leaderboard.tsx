"use client";

import { Separator } from "radix-ui";
import { api } from "~/trpc/react";

interface LeaderboardProps {
  gameId: string;
}

export function Leaderboard({ gameId }: LeaderboardProps) {
  const { data: leaderboard, isLoading } = api.game.getLeaderboard.useQuery({
    gameId,
  });

  // Show loading state only if we don't have any data yet
  if (isLoading && !leaderboard) {
    return (
      <div>
        <h2>Leaderboard</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div>
        <h2>Leaderboard</h2>
        <div>No submissions yet.</div>
      </div>
    );
  }

  return (
    <section>
      <h2>Leaderboard</h2>
      <ol role="list" aria-label="Game leaderboard">
        {leaderboard.map((entry, index) => (
          <li
            key={entry.user.id}
            role="listitem"
            aria-label={`Rank ${index + 1}: ${entry.user.name ?? entry.user.email} with ${entry.score} points`}
          >
            <div>
              <span aria-hidden="true">
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
              </span>
              <div>
                <div>{entry.user.name ?? entry.user.email}</div>
                <div>
                  {entry.challengesSolved} challenge
                  {entry.challengesSolved !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div>
              <div>{entry.score}</div>
              <div>points</div>
            </div>
            {index < leaderboard.length - 1 && <Separator.Root />}
          </li>
        ))}
      </ol>
    </section>
  );
}
