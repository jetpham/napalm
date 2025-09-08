import { readFileSync, readdirSync } from "fs";
import { join } from "path";
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
    // Skip the first 4 lines (metadata) and return the rest
    return lines.slice(4).join('\n');
  } catch (error) {
    console.error(`Error reading file ${randomFile}:`, error);
    return "Error loading ASCII art";
  }
}

export default function Napalm() {
  const randomArt = getRandomNapalmArt();

  return (
    <Ansi className="select-none">
      {randomArt}
    </Ansi>
  );
}
