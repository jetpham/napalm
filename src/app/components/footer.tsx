import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 text-center">
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
