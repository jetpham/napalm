"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Form, Toggle } from "radix-ui";
import { api } from "~/trpc/react";

export function CreateGameForm() {
  const [title, setTitle] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
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
    setDateError("");

    if (!title || !endingTime) return;

    const endingDate = new Date(endingTime);
    if (endingDate <= new Date()) {
      setDateError(
        "Ending time must be in the future. Please select a valid date and time.",
      );
      return;
    }

    createGame.mutate({
      title,
      endingTime: endingDate,
      isPublic: !isPrivate,
    });
  };

  return (
    <div>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field name="title">
          <Form.Label>Game Title</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              placeholder="Game Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please enter a game title
          </Form.Message>
        </Form.Field>

        <Form.Field name="endingTime">
          <Form.Label>Ending Time</Form.Label>
          <Form.Control asChild>
            <input
              type="datetime-local"
              value={endingTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEndingTime(e.target.value);
                setDateError(""); // Clear error when user changes the date
              }}
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please select an ending time
          </Form.Message>
          {dateError && <Form.Message>{dateError}</Form.Message>}
        </Form.Field>

        <Form.Field name="isPrivate">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Form.Label htmlFor="isPrivate">Make this game private</Form.Label>
            <Toggle.Root
              className="Toggle"
              pressed={isPrivate}
              onPressedChange={setIsPrivate}
              id="isPrivate"
              aria-label="Toggle private game setting"
            >
              {isPrivate ? "🔒" : "🌐"}
            </Toggle.Root>
          </div>
          <Form.Message>
            {isPrivate
              ? "Only invited users can join this game"
              : "Anyone can join this game"}
          </Form.Message>
        </Form.Field>

        <Form.Submit asChild>
          <button type="submit" disabled={createGame.isPending}>
            {createGame.isPending ? "Creating..." : "Create Game"}
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}
