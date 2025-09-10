import { auth, signOut } from "~/server/auth";
import Napalm from "./napalm";
import Link from "next/link";

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-full justify-center">
          <Link
            href="/"
            className="inline-block max-w-full cursor-pointer overflow-hidden"
          >
            <Napalm />
          </Link>
        </div>
        {session && (
          <div className="flex w-full justify-end">
            <div className="flex items-center gap-4">
              {session.user?.username && (
                <span style={{ color: "var(--yellow)" }}>
                  {session.user.username}
                </span>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit">
                  <div className="bg-transparent px-4 py-2 text-[var(--red)] hover:bg-[var(--red)] hover:text-[var(--white)]">
                    Sign out
                  </div>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
