import { Separator } from "radix-ui";
import { CreateGameForm } from "~/app/components/create-game";
import { GamesList } from "~/app/components/games-list";
import GoogleAns from "~/app/components/google-ans";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoogleAns />
        </div>
        {session?.user && (
          <div>
            <CreateGameForm />
            <Separator.Root />
            <GamesList />
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
