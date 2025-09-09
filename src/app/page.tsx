import { Tabs } from "radix-ui";
import { GamesTab } from "~/app/components/tabs/games-tab";
import { CreateGameTab } from "~/app/components/tabs/create-game-tab";
import { AccountTab } from "~/app/components/tabs/account-tab";
import { SignIn } from "~/app/components/signin";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="w-full flex-1 px-4 py-8">
        {session?.user ? (
          session.user.username ? (
            <Tabs.Root defaultValue="games" className="w-full">
              <Tabs.List className="flex border-b border-gray-200 mb-6">
                <Tabs.Trigger 
                  value="games" 
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Games
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="create" 
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Create Game
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="account" 
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Account
                </Tabs.Trigger>
              </Tabs.List>
              
              <Tabs.Content value="games" className="mt-4">
                <GamesTab />
              </Tabs.Content>
              
              <Tabs.Content value="create" className="mt-4">
                <CreateGameTab />
              </Tabs.Content>
              
              <Tabs.Content value="account" className="mt-4">
                <AccountTab />
              </Tabs.Content>
            </Tabs.Root>
          ) : (
            <div className="flex min-h-[50vh] justify-center">
              <AccountTab />
            </div>
          )
        ) : (
          <SignIn />
        )}
      </div>
    </HydrateClient>
  );
}
