import { notFound, redirect } from "next/navigation";

import { GamePage } from "~/app/components/game-page";
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

  // Ensure user has completed username setup
  if (!session.user.username) {
    return redirect("/");
  }

  const game = await api.game.getById({ id });
  if (!game) {
    notFound();
  }

  const isAdmin = game.adminId === session.user.id;

  // Prefetch data for the game page (for client components)
  void api.challenge.getByGame.prefetch({ gameId: id });
  void api.game.isGameEnded.prefetch({ gameId: id });

  return (
    <HydrateClient>
      <GamePage 
        gameId={id} 
        userId={session.user.id} 
        isAdmin={isAdmin}
      />
    </HydrateClient>
  );
}
