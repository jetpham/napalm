import { Separator } from "radix-ui";
import { CreateGameForm } from "~/app/components/create-game";
import { GamesList } from "~/app/components/games-list";
import { auth, signIn } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import Ansi from "~/app/components/ansi";
import googleAnsi from "~/assets/google.utf8ans";
import githubAnsi from "~/assets/github.utf8ans";

const SIGNIN_ERROR_URL = "/error";

// Create provider map for dynamic rendering
const providerMap = [
  { id: "google", name: "Google", art: googleAnsi },
  { id: "github", name: "GitHub", art: githubAnsi },
];

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="container mx-auto px-4 py-8">
        {session?.user ? (
          <div>
            <CreateGameForm />
            <Separator.Root />
            <GamesList />
          </div>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
            <div className="flex gap-8">
              {providerMap.map((provider) => (
                <form
                  key={provider.id}
                  action={async () => {
                    "use server";
                    try {
                      await signIn(provider.id, {
                        redirectTo: "/",
                      });
                    } catch (error) {
                      // Signin can fail for a number of reasons, such as the user
                      // not existing, or the user not having the correct role.
                      // In some cases, you may want to redirect to a custom error
                      if (error instanceof AuthError) {
                        return redirect(
                          `${SIGNIN_ERROR_URL}?error=${error.type}`,
                        );
                      }

                      // Otherwise if a redirects happens Next.js can handle it
                      // so you can just re-thrown the error and let Next.js handle it.
                      // Docs:
                      // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                      throw error;
                    }
                  }}
                >
                  <button
                    type="submit"
                    className="cursor-pointer border-none bg-transparent p-0"
                  >
                    <Ansi className="select-none">{provider.art}</Ansi>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
