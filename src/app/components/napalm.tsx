import Link from "next/link";
import Ansi from "./ansi";
import { napalmArt } from "../../assets/napalm-index";

export default function Napalm() {
  const randomIndex = Math.floor(Math.random() * napalmArt.length);
  const randomArt = napalmArt[randomIndex]!;

  return (
    <Link href="/" className="inline-block cursor-pointer">
      <Ansi className="select-none">
        {randomArt}
      </Ansi>
    </Link>
  );
}
