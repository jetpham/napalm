"use client";

import { useState } from "react";

import { Form, Separator } from "radix-ui";
import { api } from "~/trpc/react";

interface ChallengeItemProps {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    pointValue: number;
    hasCorrectSubmission: boolean;
  };
  isAdmin: boolean;
  isGameEnded: boolean;
}

export function ChallengeItem({
  challenge,
  isAdmin,
  isGameEnded,
}: ChallengeItemProps) {
  const [flag, setFlag] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const [message, setMessage] = useState("");

  const utils = api.useUtils();
  const submitFlag = api.submission.submit.useMutation({
    onSuccess: () => {
      // If we get here, the submission was correct
      setMessage("Correct! 🎉");
      setFlag("");
      void utils.challenge.getByGame.invalidate();
      void utils.game.getLeaderboard.invalidate();
    },
    onError: (error) => {
      if (error.message.includes("Already solved")) {
        setMessage("You've already solved this challenge!");
      } else if (error.message.includes("already submitted this flag")) {
        setMessage("You've already tried this flag. Try a different one!");
      } else if (error.message.includes("Incorrect flag")) {
        setMessage("Incorrect flag. Try again!");
      } else {
        setMessage("Error submitting flag. Try again!");
      }
    },
  });

  const getFlag = api.challenge.getFlag.useQuery(
    { challengeId: challenge.id },
    { enabled: isAdmin || challenge.hasCorrectSubmission },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setMessage("");
    submitFlag.mutate({
      challengeId: challenge.id,
      flag: flag.trim(),
    });
  };

  const handleShowFlag = async () => {
    try {
      await getFlag.refetch();
      setShowFlag(true);
    } catch {
      setMessage("Unable to show flag");
    }
  };

  const shouldShowInput =
    !isAdmin && !challenge.hasCorrectSubmission && !isGameEnded;
  const shouldShowFlag = isAdmin || challenge.hasCorrectSubmission || showFlag;

  return (
    <article>
      <header>
        <h3>{challenge.title}</h3>
        <span aria-label={`${challenge.pointValue} points`}>
          {challenge.pointValue} points
        </span>
      </header>

      {challenge.description && <p>{challenge.description}</p>}

      <Separator.Root />

      {shouldShowInput && (
        <Form.Root onSubmit={handleSubmit}>
          <Form.Field name="flag">
            <Form.Label>Enter flag</Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                placeholder="Enter flag"
                value={flag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFlag(e.target.value)
                }
                required
              />
            </Form.Control>
            <Form.Message match="valueMissing">
              Please enter a flag
            </Form.Message>
          </Form.Field>
          <Form.Submit asChild>
            <button type="submit" disabled={submitFlag.isPending}>
              {submitFlag.isPending ? "Submitting..." : "Submit Flag"}
            </button>
          </Form.Submit>
        </Form.Root>
      )}

      {shouldShowInput && shouldShowFlag && <Separator.Root />}

      {shouldShowFlag && (
        <div>
          <div>
            <p>
              Flag:{" "}
              {getFlag.isLoading
                ? "Loading..."
                : (getFlag.data ?? "Unable to load flag")}
            </p>
          </div>
          {!isAdmin && !challenge.hasCorrectSubmission && (
            <button onClick={handleShowFlag} type="button">
              Show flag
            </button>
          )}
        </div>
      )}

      {isGameEnded && !shouldShowInput && !shouldShowFlag && (
        <div>
          <p>Game has ended</p>
        </div>
      )}

      {message && (
        <div role="status" aria-live="polite">
          {message}
        </div>
      )}
    </article>
  );
}
