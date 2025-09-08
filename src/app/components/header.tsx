import { auth, signOut } from "~/server/auth";
import Napalm from "./napalm";

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full">
      <div className="flex flex-col items-center">
        <div className="flex justify-center w-full">
          <div>
            <Napalm />
          </div>
        </div>
        <div className="flex justify-end w-full p-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-[var(--light-blue)]">
                {session.user?.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-1 text-sm border border-[var(--red)] text-[var(--red)] bg-transparent hover:bg-[var(--red)] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--red)] transition-colors duration-200 rounded"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
