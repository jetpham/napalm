"use client";

import { useState } from "react";

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
    } catch (error) {
      setMessage("Unable to show flag");
    }
  };

  const shouldShowInput =
    !isAdmin && !challenge.hasCorrectSubmission && !isGameEnded;
  const shouldShowFlag = isAdmin || challenge.hasCorrectSubmission || showFlag;

  return (
    <div>
      <div>
        <h3>{challenge.title}</h3>
        <span>
          {challenge.pointValue} points
        </span>
      </div>

      {challenge.description && (
        <p>{challenge.description}</p>
      )}

      {shouldShowInput && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitFlag.isPending}
          >
            {submitFlag.isPending ? "Submitting..." : "Submit Flag"}
          </button>
        </form>
      )}

      {shouldShowFlag && (
        <div>
          <div>
            <p>
              Flag: {getFlag.isLoading ? "Loading..." : getFlag.data || "Unable to load flag"}
            </p>
          </div>
          {!isAdmin && !challenge.hasCorrectSubmission && (
            <button
              onClick={handleShowFlag}
            >
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
        <div>
          {message}
        </div>
      )}
    </div>
  );
}
