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
        <div className="-mt-2" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link 
            href="/"
            className="text-[var(--light-blue)] underline hover:bg-[var(--blue)] hover:text-[var(--white)] px-4 py-2"
          >
            {"<- Back to Home"}
          </Link>
          <Link 
            href={`/game/${gameId}/leaderboard`}
            className="text-[var(--light-blue)] underline hover:bg-[var(--blue)] hover:text-[var(--white)] px-4 py-2"
          >
            {"Full Leaderboard ->"}
          </Link>
        </div>
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
