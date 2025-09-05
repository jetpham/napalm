"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

interface CreateChallengeFormProps {
  gameId: string;
  userId: string;
}

export function CreateChallengeForm({
  gameId,
  userId,
}: CreateChallengeFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [flag, setFlag] = useState("");
  const [pointValue, setPointValue] = useState(100);

  const { data: game } = api.game.getById.useQuery({ id: gameId });
  const { data: isGameEnded } = api.game.isGameEnded.useQuery({ gameId });

  const utils = api.useUtils();
  const createChallenge = api.challenge.create.useMutation({
    onSuccess: () => {
      void utils.challenge.getByGame.invalidate();
      setTitle("");
      setDescription("");
      setFlag("");
      setPointValue(100);
    },
  });

  const isAdmin = game?.adminId === userId;
  const canCreateChallenge = isAdmin && !isGameEnded;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !flag || pointValue <= 0) return;

    createChallenge.mutate({
      gameId,
      title,
      description: description || undefined,
      flag,
      pointValue,
    });
  };

  if (!canCreateChallenge) {
    return null;
  }

  return (
    <div>
      <h3>Create New Challenge</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Challenge Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <input
          type="text"
          placeholder="Flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Point Value"
          value={pointValue}
          onChange={(e) => setPointValue(Number(e.target.value))}
          min="1"
          required
        />
        <button
          type="submit"
          disabled={createChallenge.isPending}
        >
          {createChallenge.isPending ? "Creating..." : "Create Challenge"}
        </button>
      </form>
    </div>
  );
}
