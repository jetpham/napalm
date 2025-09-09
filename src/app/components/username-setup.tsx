"use client";

import { useState, useEffect } from "react";
import { Form } from "radix-ui";
import { api } from "~/trpc/react";

interface UsernameSetupProps {
  buttonText?: string;
}

export default function UsernameSetup({
  buttonText = "Continue",
}: UsernameSetupProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  const utils = api.useUtils();
  const updateUsernameMutation = api.account.updateUsername.useMutation();
  const { data: currentUser } = api.account.getMe.useQuery();

  // Username availability check
  useEffect(() => {
    // Check all validation rules before making API request
    if (
      username.length < 3 ||
      username.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(username)
    ) {
      setIsAvailable(null);
      return;
    }

    // If it's the current user's username, mark as available (no need to query)
    if (currentUser?.username === username) {
      setIsAvailable(true);
      setQueryTime(null);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setQueryTime(null);
      const startTime = performance.now();

      try {
        // Invalidate any cached result for this username to force a fresh check
        await utils.account.checkUsername.invalidate({ username });
        const result = await utils.account.checkUsername.fetch({ username });
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        setIsAvailable(result.available);
        setQueryTime(duration);
        setError(null);
      } catch {
        setError("Failed to check username availability");
        setIsAvailable(null);
        setQueryTime(null);
      } finally {
        setIsChecking(false);
      }
    };

    void checkUsername();
  }, [username, utils, currentUser?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateUsernameMutation.mutateAsync({ username });
      // Refresh the page to update the session and show the main content
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set username");
    }
  };

  return (
    <Form.Root
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4"
    >
      <Form.Field
        name="username"
        className="flex w-full flex-col items-center gap-2"
      >
        <div className="text-center">
          {username.length === 0 && (
            <div className="text-[var(--red)]">Please enter a username</div>
          )}
          {username.length > 0 && username.length < 3 && (
            <div className="text-[var(--red)]">
              Username must be at least 3 characters
            </div>
          )}
          {username.length > 20 && (
            <div className="text-[var(--red)]">
              Username must be 20 characters or less
            </div>
          )}
          {username.length >= 3 &&
            username.length <= 20 &&
            !/^[a-zA-Z0-9]+$/.test(username) && (
              <div className="text-[var(--red)]">
                Username can only contain letters and numbers. Try:{" "}
                {username.replace(/[^a-zA-Z0-9]/g, "")}
              </div>
            )}
          {username.length >= 3 &&
            username.length <= 20 &&
            /^[a-zA-Z0-9]+$/.test(username) &&
            currentUser?.username === username && (
              <div className="text-[var(--red)]">
                This is already your current username
              </div>
            )}
          {username.length >= 3 &&
            username.length <= 20 &&
            /^[a-zA-Z0-9]+$/.test(username) &&
            currentUser?.username !== username &&
            isChecking && (
              <div className="text-[var(--light-blue)]">
                Checking availability...
              </div>
            )}
          {username.length >= 3 &&
            username.length <= 20 &&
            /^[a-zA-Z0-9]+$/.test(username) &&
            currentUser?.username !== username &&
            !isChecking &&
            isAvailable === false && (
              <div className="text-[var(--red)]">
                Username is already taken {queryTime && `(${queryTime}ms)`}
              </div>
            )}
          {username.length >= 3 &&
            username.length <= 20 &&
            /^[a-zA-Z0-9]+$/.test(username) &&
            currentUser?.username !== username &&
            !isChecking &&
            isAvailable === true && (
              <div className="text-[var(--green)]">
                Username is available {queryTime && `(${queryTime}ms)`}
              </div>
            )}
          {error && <div className="text-[var(--red)]">{error}</div>}
        </div>
        <div className="flex items-center gap-3">
          <Form.Label>Username:</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              disabled={updateUsernameMutation.isPending}
              required
              className="text-center"
            />
          </Form.Control>
        </div>
      </Form.Field>

      <Form.Submit asChild>
        <button
          type="submit"
          className="disabled:cursor-not-allowed"
          disabled={
            updateUsernameMutation.isPending ||
            isChecking ||
            isAvailable !== true ||
            username.length < 3 ||
            username.length > 20 ||
            !/^[a-zA-Z0-9]+$/.test(username) ||
            currentUser?.username === username
          }
        >
          <div className="px-4 py-2 text-[var(--white)] hover:bg-[var(--light-gray)] hover:text-[var(--black)] disabled:bg-transparent disabled:text-[var(--dark-gray)]">
            {updateUsernameMutation.isPending
              ? "Setting Username..."
              : buttonText}
          </div>
        </button>
      </Form.Submit>
    </Form.Root>
  );
}
