import { Separator } from "radix-ui";
import { api } from "~/trpc/server";
import { ChallengeItem } from "./challenge-item";

interface ChallengeListProps {
  gameId: string;
  userId: string;
}

export async function ChallengeList({ gameId, userId }: ChallengeListProps) {
  // Fetch data server-side
  const [game, challenges, isGameEnded] = await Promise.all([
    api.game.getById({ id: gameId }),
    api.challenge.getByGame({ gameId }),
    api.game.isGameEnded({ gameId }),
  ]);

  if (!game) {
    return (
      <div>
        <div>Game not found.</div>
      </div>
    );
  }

  const isAdmin = game.adminId === userId;

  return (
    <div>
      <header>
        <h1>{game.title}</h1>
        {game.description && (
          <p className="mb-2 text-[var(--light-gray)]">{game.description}</p>
        )}
        <p>
          Created by{" "}
          <span style={{ color: "var(--yellow)" }}>{game.admin.username}</span>
        </p>
        <p>Ends: {new Date(game.endingTime).toLocaleString()}</p>
        {isGameEnded && (
          <p role="status" aria-live="polite">
            This game has ended.
          </p>
        )}
      </header>

      <Separator.Root />

      <section>
        {!challenges || challenges.length === 0 ? (
          <p>No challenges yet.</p>
        ) : (
          <div role="list" aria-label="Game challenges">
            {challenges.map((challenge, index) => (
              <div key={challenge.id} role="listitem" className="py-2">
                <ChallengeItem
                  challenge={challenge}
                  isAdmin={isAdmin}
                  isGameEnded={isGameEnded ?? false}
                />
                {index < challenges.length - 1 && <Separator.Root />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
