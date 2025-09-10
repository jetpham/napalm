import { Tabs } from "radix-ui";
import { GamesTab } from "~/app/components/tabs/games-tab";
import { CreateGameTab } from "~/app/components/tabs/create-game-tab";
import { AccountTab } from "~/app/components/tabs/account-tab";
import { SignIn } from "~/app/components/signin";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import UsernameSetup from "./components/username-setup";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="w-full flex-1">
        {session?.user ? (
          session.user.username ? (
            <Tabs.Root defaultValue="games" className="w-full">
              <Tabs.List className="-mt-2 mb-6 flex">
                <Tabs.Trigger
                  value="games"
                  className="px-4 py-2 text-[var(--light-gray)] hover:bg-[var(--blue)] hover:text-[var(--white)] data-[state=active]:text-[var(--light-blue)] data-[state=active]:hover:bg-[var(--white)] data-[state=active]:hover:text-[var(--light-blue)]"
                >
                  Games
                </Tabs.Trigger>
                {session.user.username === "jet" && (
                  <Tabs.Trigger
                    value="create"
                    className="px-4 py-2 text-[var(--light-gray)] hover:bg-[var(--blue)] hover:text-[var(--white)] data-[state=active]:text-[var(--light-blue)] data-[state=active]:hover:bg-[var(--white)] data-[state=active]:hover:text-[var(--light-blue)]"
                  >
                    Create Game
                  </Tabs.Trigger>
                )}
                <Tabs.Trigger
                  value="account"
                  className="px-4 py-2 text-[var(--light-gray)] hover:bg-[var(--blue)] hover:text-[var(--white)] data-[state=active]:text-[var(--light-blue)] data-[state=active]:hover:bg-[var(--white)] data-[state=active]:hover:text-[var(--light-blue)]"
                >
                  Account
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="games" className="mt-4">
                <GamesTab />
              </Tabs.Content>

              {session.user.username === "jet" && (
                <Tabs.Content value="create" className="mt-4">
                  <CreateGameTab />
                </Tabs.Content>
              )}

              <Tabs.Content value="account" className="mt-4">
                <AccountTab />
              </Tabs.Content>
            </Tabs.Root>
          ) : (
            <div className="flex min-h-[50vh] justify-center">
              <UsernameSetup buttonText="Continue to Napalm" />
            </div>
          )
        ) : (
          <SignIn />
        )}
      </div>
    </HydrateClient>
  );
}
