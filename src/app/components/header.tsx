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
              <span className="text-[var(--white)]">
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
                  className="text-sm text-[var(--red)] bg-transparent hover:bg-[var(--red)] hover:text-[var(--white)] focus:outline-none"
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
