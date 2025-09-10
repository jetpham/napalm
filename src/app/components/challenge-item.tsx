"use client";

import { useState, useEffect } from "react";

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
  const [message, setMessage] = useState("");
  const [justSolved, setJustSolved] = useState(false);

  const utils = api.useUtils();
  const submitFlag = api.submission.submit.useMutation({
    onSuccess: () => {
      // If we get here, the submission was correct
      setMessage("Correct!");
      setFlag("");
      setJustSolved(true); // Mark that this challenge was just solved
      void utils.challenge.getByGame.invalidate();
      void utils.game.getLeaderboard.invalidate();
      void getFlag.refetch(); // Refetch the flag data so it's available immediately
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

  const shouldShowInput =
    !isAdmin && !challenge.hasCorrectSubmission && !isGameEnded && !justSolved;
  const shouldShowFlag =
    isAdmin || challenge.hasCorrectSubmission || justSolved;

  // Auto-clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-[var(--light-gray)]">
      <article>
        <header className="flex items-center pb-2">
          <div className="flex-1"></div>
          <h3 className="bg-[var(--dark-gray)] px-2 text-[var(--white)]">
            {challenge.title}
          </h3>
          <div className="flex flex-1 justify-end">
            <span
              aria-label={`${challenge.pointValue} points`}
              className="bg-[var(--green)] px-2 font-bold text-[var(--white)]"
            >
              {challenge.pointValue} points
            </span>
          </div>
        </header>

        {challenge.description && (
          <div className="bg-[var(--light-gray)] text-[var(--black)]">
            <p className="pl-2 break-words whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>
        )}

        <Separator.Root />

        {shouldShowInput && (
          <Form.Root onSubmit={handleSubmit}>
            <Form.Field name="flag">
              <div className="flex">
                <Form.Control asChild>
                  <input
                    type="text"
                    placeholder="Enter flag"
                    value={flag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFlag(e.target.value);
                      // Clear any previous error message when user starts typing
                      if (message) {
                        setMessage("");
                      }
                    }}
                    className="flex-1 pl-2 text-[var(--dark-gray)]"
                  />
                </Form.Control>
                <Form.Submit asChild>
                  <button
                    type="submit"
                    className="disabled:cursor-not-allowed"
                    disabled={submitFlag.isPending || !flag.trim()}
                  >
                    <div className="bg-[var(--dark-gray)] px-4 py-2 text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--red)] disabled:bg-transparent disabled:text-[var(--dark-gray)]">
                      {submitFlag.isPending ? "Submitting..." : "Submit Flag"}
                    </div>
                  </button>
                </Form.Submit>
              </div>
            </Form.Field>
          </Form.Root>
        )}

        {shouldShowInput && shouldShowFlag && <Separator.Root />}

        {shouldShowFlag && (
          <div>
            <div>
              <p className="py-2 pl-2 text-[var(--dark-gray)]">
                Flag:{""}
                <span
                  className={
                    (getFlag.isLoading
                      ? "text-[var(--yellow)]"
                      : getFlag.data
                        ? "bg-[var(--green)] text-[var(--white)]"
                        : "bg-[var(--red)] text-[var(--white)]") + " px-2"
                  }
                >
                  {getFlag.isLoading
                    ? "Loading..."
                    : (getFlag.data ?? "Unable to load flag")}
                </span>
              </p>
            </div>
          </div>
        )}

        {isGameEnded && !shouldShowInput && !shouldShowFlag && (
          <div>
            <p>Game has ended</p>
          </div>
        )}

        {message && (
          <div role="status" aria-live="polite" className="text-center">
            <p
              className={
                message.includes("Correct!")
                  ? "bg-[var(--green)] text-[var(--white)]"
                  : message.includes("already") ||
                      message.includes("Incorrect") ||
                      message.includes("Error")
                    ? "bg-[var(--red)] text-[var(--white)]"
                    : "bg-[var(--blue)] text-[var(--white)]"
              }
            >
              {message}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
