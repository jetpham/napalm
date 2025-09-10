import { GamesList } from "~/app/components/games-list";

export async function GamesTab() {
  return (
    <div className="space-y-4">
      <GamesList />
    </div>
  );
}
