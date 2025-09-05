"use client";

import { useState } from "react";

import { Form } from "radix-ui";
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
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field name="title">
          <Form.Label>Challenge Title</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              placeholder="Challenge Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a challenge title
          </Form.Message>
        </Form.Field>

        <Form.Field name="description">
          <Form.Label>Description (optional)</Form.Label>
          <Form.Control asChild>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
            />
          </Form.Control>
        </Form.Field>

        <Form.Field name="flag">
          <Form.Label>Flag</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              placeholder="Flag"
              value={flag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlag(e.target.value)}
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a flag
          </Form.Message>
        </Form.Field>

        <Form.Field name="pointValue">
          <Form.Label>Point Value</Form.Label>
          <Form.Control asChild>
            <input
              type="number"
              placeholder="Point Value"
              value={pointValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPointValue(Number(e.target.value))}
              min="1"
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a point value
          </Form.Message>
          <Form.Message match="rangeUnderflow">
            Point value must be at least 1
          </Form.Message>
        </Form.Field>

        <Form.Submit asChild>
          <button
            type="submit"
            disabled={createChallenge.isPending}
          >
            {createChallenge.isPending ? "Creating..." : "Create Challenge"}
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}
