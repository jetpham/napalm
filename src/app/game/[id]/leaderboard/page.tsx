import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Leaderboard } from "~/app/components/leaderboard";

interface LeaderboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeaderboardPageRoute({
  params,
}: LeaderboardPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  // Ensure user has completed username setup
  if (!session.user.username) {
    return redirect("/");
  }

  const game = await api.game.getById({ id });
  if (!game) {
    notFound();
  }

  // Prefetch data for the leaderboard page
  void api.game.getLeaderboard.prefetch({ gameId: id });

  return (
    <HydrateClient>
      <div>
        <div className="-mt-2" style={{ marginBottom: "1rem" }}>
          <Link
            href={`/game/${id}`}
            className="px-4 py-2 text-[var(--light-blue)] underline hover:bg-[var(--blue)] hover:text-[var(--white)]"
          >
            {"<- Back to Game"}
          </Link>
        </div>
        <h1 style={{ marginBottom: "1rem" }}>Full Leaderboard</h1>
        <Leaderboard gameId={id} />
      </div>
    </HydrateClient>
  );
}
