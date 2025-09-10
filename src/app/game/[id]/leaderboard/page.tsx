import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { Leaderboard } from "~/app/components/leaderboard";

export const experimental_ppr = true;

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

  const isAdmin = game.adminId === session.user.id;

  return (
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
      <Leaderboard
        gameId={id}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
