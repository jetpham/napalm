import { auth, signOut } from "~/server/auth";
import Napalm from "./napalm";

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full justify-center">
          <div className="max-w-full overflow-hidden">
            <Napalm />
          </div>
        </div>
        {session && (
          <div className="flex w-full justify-end">
            <div className="flex items-center gap-4">
              {session.user?.username && (
                <span className="text-[var(--white)]">
                  {session.user.username}
                </span>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="bg-transparent text-[var(--red)] hover:bg-[var(--red)] hover:text-[var(--white)] focus:outline-none"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
