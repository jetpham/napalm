import Ansi from "./ansi";
import { napalmArt } from "../../assets/napalm-index";

export default function Napalm() {
  const randomIndex = Math.floor(Math.random() * napalmArt.length);
  const lines = napalmArt[randomIndex]!.split("\n");

  // Remove empty lines from beginning and end
  let startIndex = 0;
  let endIndex = lines.length;

  // Find first non-empty line
  while (startIndex < lines.length && lines[startIndex]!.trim() === "") {
    startIndex++;
  }

  // Find last non-empty line
  while (endIndex > startIndex && lines[endIndex - 1]!.trim() === "") {
    endIndex--;
  }

  const randomArt = lines.slice(startIndex, endIndex).join("\n");

  return (
      <Ansi className="select-none">{randomArt}</Ansi>
  );
}
