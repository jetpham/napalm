import Link from "next/link";
import { auth } from "~/server/auth";
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
            <>
              <span className="mr-2">
                {session.user?.name}
              </span>
              <Link href="/api/auth/signout" style={{ color: 'var(--red)' }}>
                Sign out
              </Link>
            </>
          ) : (
            <Link href="/api/auth/signin" style={{ color: 'var(--green)' }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
