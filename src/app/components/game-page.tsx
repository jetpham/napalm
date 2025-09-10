import { Suspense } from "react";
import Link from "next/link";
import { Separator } from "radix-ui";
import { ChallengeList } from "./challenge-list";
import { CreateChallengeForm } from "./create-challenge";
import { Leaderboard } from "./leaderboard";

interface GamePageProps {
  gameId: string;
  userId: string;
  isAdmin: boolean;
}

export async function GamePage({ gameId, userId, isAdmin }: GamePageProps) {
  return (
    <main>
      <div>
        <div
          className="-mt-2"
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            className="px-4 py-2 text-[var(--light-blue)] underline hover:bg-[var(--blue)] hover:text-[var(--white)]"
          >
            {"<- Back to Home"}
          </Link>
          <Link
            href={`/game/${gameId}/leaderboard`}
            className="px-4 py-2 text-[var(--light-blue)] underline hover:bg-[var(--blue)] hover:text-[var(--white)]"
          >
            {"Full Leaderboard ->"}
          </Link>
        </div>
        <div>
          <div>
            <Suspense fallback={<div>Loading leaderboard...</div>}>
              <Leaderboard
                gameId={gameId}
                maxListed={10}
                currentUserId={userId}
                isAdmin={isAdmin}
              />
            </Suspense>
          </div>

          <Separator.Root />

          <div>
            <Suspense fallback={<div>Loading challenges...</div>}>
              <ChallengeList gameId={gameId} userId={userId} />
            </Suspense>
            <Separator.Root />
            <Suspense fallback={<div>Loading create challenge form...</div>}>
              <CreateChallengeForm gameId={gameId} userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
