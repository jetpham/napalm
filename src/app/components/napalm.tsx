import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import Link from "next/link";
import Ansi from "./ansi";

function getRandomNapalmArt(): string {
  const napalmDir = join(process.cwd(), "public", "napalm");
  const files = readdirSync(napalmDir).filter(file => file.endsWith('.tdf.txt'));
  
  if (files.length === 0) {
    return "No ASCII art files found";
  }
  
  const randomIndex = Math.floor(Math.random() * files.length);
  const randomFile = files[randomIndex]!;
  const filePath = join(napalmDir, randomFile);
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const artLines = lines.slice(4);
    while (artLines.length > 0 && artLines[artLines.length - 1]?.trim() === '') {
      artLines.pop();
    }
    return artLines.join('\n');
  } catch (error) {
    console.error(`Error reading file ${randomFile}:`, error);
    return "Error loading ASCII art";
  }
}

export default function Napalm() {
  const randomArt = getRandomNapalmArt();

  return (
    <Link href="/" className="inline-block cursor-pointer">
      <Ansi className="select-none">
        {randomArt}
      </Ansi>
    </Link>
  );
}
