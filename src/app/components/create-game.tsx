"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AlertDialog, Form } from "radix-ui";
import { api } from "~/trpc/react";

export function CreateGameForm() {
  const [title, setTitle] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [showAlert, setShowAlert] = useState(false);
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
      setShowAlert(true);
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEndingTime(e.target.value)
              }
              required
            />
          </Form.Control>
          <Form.Message match="valueMissing">
            Please select an ending time
          </Form.Message>
        </Form.Field>

        <Form.Submit asChild>
          <button type="submit" disabled={createGame.isPending}>
            {createGame.isPending ? "Creating..." : "Create Game"}
          </button>
        </Form.Submit>
      </Form.Root>

      <AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title>Invalid Date</AlertDialog.Title>
            <AlertDialog.Description>
              Ending time must be in the future. Please select a valid date and
              time.
            </AlertDialog.Description>
            <AlertDialog.Action onClick={() => setShowAlert(false)}>
              OK
            </AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
