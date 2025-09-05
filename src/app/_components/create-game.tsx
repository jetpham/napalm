"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export function CreateGameForm() {
  const [title, setTitle] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const router = useRouter();

  const utils = api.useUtils();
  const createGame = api.game.create.useMutation({
    onSuccess: (game) => {
      void utils.game.getAll.invalidate();
      router.push(`/game/${game.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !endingTime) return;

    const endingDate = new Date(endingTime);
    if (endingDate <= new Date()) {
      alert("Ending time must be in the future");
      return;
    }

    createGame.mutate({
      title,
      endingTime: endingDate,
    });
  };

  return (
    <div>
      <h2>Create New Game</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Game Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={endingTime}
          onChange={(e) => setEndingTime(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={createGame.isPending}
        >
          {createGame.isPending ? "Creating..." : "Create Game"}
        </button>
      </form>
    </div>
  );
}
