import { notFound } from "next/navigation";

import { GamePage } from "~/app/_components/game-page";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePageRoute({ params }: GamePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const game = await api.game.getById({ id });
  if (!game) {
    notFound();
  }

  // Prefetch data for the game page
  void api.game.getLeaderboard.prefetch({ gameId: id });
  void api.challenge.getByGame.prefetch({ gameId: id });
  void api.game.isGameEnded.prefetch({ gameId: id });

  return (
    <HydrateClient>
      <GamePage gameId={id} userId={session.user.id} />
    </HydrateClient>
  );
}
