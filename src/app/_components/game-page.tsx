"use client";

import Link from "next/link";

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
          <Link href="/">
            Back to Home
          </Link>
        </div>

        <div>
          {/* Leaderboard at top */}
          <div>
            <Leaderboard gameId={gameId} />
          </div>

          {/* Main content - challenges */}
          <div>
            <ChallengeList gameId={gameId} userId={userId} />
            <CreateChallengeForm gameId={gameId} userId={userId} />
          </div>
        </div>
      </div>
    </main>
  );
}
