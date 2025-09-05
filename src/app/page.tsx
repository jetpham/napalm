import Link from "next/link";

import { Separator } from "radix-ui";
import { CreateGameForm } from "~/app/components/create-game";
import { GamesList } from "~/app/components/games-list";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main>
        <div>
          <div>
            <h1>Capture The Flag</h1>
            <div>
              <p>
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && (
            <div>
              <CreateGameForm />
              <Separator.Root />
              <GamesList />
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
