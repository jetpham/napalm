import Link from "next/link";

export default function Footer() {
  return (
    <footer className="m-4 w-full space-y-2 p-4 text-center">
      <div>
        A CTF Platform Made by{" "}
        <Link
          href="https://jetpham.com"
          className="text-[var(--light-blue)] underline"
        >
          Jet
        </Link>
      </div>
    </footer>
  );
}
