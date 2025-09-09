"use client";

import Link from "next/link";

import { Separator } from "radix-ui";
import { ChallengeList } from "./challenge-list";
import { CreateChallengeForm } from "./create-challenge";
import { Leaderboard } from "./leaderboard";

interface GamePageProps {
  gameId: string;
  userId: string;
}

export function GamePage({ gameId, userId }: GamePageProps) {
  return (
    <main>
      <div>
        <div>
          <div>
            <Leaderboard gameId={gameId} />
          </div>

          <Separator.Root />

          <div>
            <ChallengeList gameId={gameId} userId={userId} />
            <Separator.Root />
            <CreateChallengeForm gameId={gameId} userId={userId} />
          </div>
        </div>
      </div>
    </main>
  );
}
