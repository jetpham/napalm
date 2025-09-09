"use client";

import { GamesList } from "~/app/components/games-list";

export function GamesTab() {
  return (
    <div className="space-y-4">
      <GamesList />
    </div>
  );
}
