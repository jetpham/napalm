"use client";

import { useState } from "react";

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
      <div>
        <h1>{game.title}</h1>
        <p>
          Created by {game.admin.name || game.admin.email}
        </p>
        <p>
          Ends: {new Date(game.endingTime).toLocaleString()}
        </p>
        {isGameEnded && (
          <p>This game has ended.</p>
        )}
      </div>

      <h2>Challenges</h2>
      {!challenges || challenges.length === 0 ? (
        <div>No challenges yet.</div>
      ) : (
        <div>
          {challenges.map((challenge) => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              isAdmin={isAdmin}
              isGameEnded={isGameEnded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
