"use client";

import { useState } from "react";

import { Separator } from "radix-ui";
import { api } from "~/trpc/react";

import { ChallengeItem } from "./challenge-item";

interface ChallengeListProps {
  gameId: string;
  userId: string;
}

export function ChallengeList({ gameId, userId }: ChallengeListProps) {
  const { data: game, isLoading: gameLoading } = api.game.getById.useQuery({
    id: gameId,
  });
  const { data: challenges, isLoading: challengesLoading } =
    api.challenge.getByGame.useQuery({
      gameId,
    });
  const { data: isGameEnded } = api.game.isGameEnded.useQuery({ gameId });

  if (gameLoading || challengesLoading) {
    return (
      <div>
        <h2>Challenges</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div>
        <h2>Challenges</h2>
        <div>Game not found.</div>
      </div>
    );
  }

  const isAdmin = game.adminId === userId;

  return (
    <div>
      <header>
        <h1>{game.title}</h1>
        <p>
          Created by {game.admin.name || game.admin.email}
        </p>
        <p>
          Ends: {new Date(game.endingTime).toLocaleString()}
        </p>
        {isGameEnded && (
          <p role="status" aria-live="polite">This game has ended.</p>
        )}
      </header>

      <Separator.Root />

      <section>
        <h2>Challenges</h2>
        {!challenges || challenges.length === 0 ? (
          <p>No challenges yet.</p>
        ) : (
          <div role="list" aria-label="Game challenges">
            {challenges.map((challenge, index) => (
              <div key={challenge.id} role="listitem">
                <ChallengeItem
                  challenge={challenge}
                  isAdmin={isAdmin}
                  isGameEnded={isGameEnded ?? false}
                />
                {index < challenges.length - 1 && <Separator.Root />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
