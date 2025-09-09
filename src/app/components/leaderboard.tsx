"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

interface LeaderboardProps {
  gameId: string;
  maxListed?: number;
}

export function Leaderboard({ 
  gameId, 
  maxListed
}: LeaderboardProps) {
  const { data: leaderboard, isLoading } = api.game.getLeaderboard.useQuery({
    gameId,
  });
  const { data: currentUser } = api.account.getMe.useQuery();
  const { data: game } = api.game.getById.useQuery({ id: gameId });

  // Show loading state only if we're actually loading and have no data
  if (isLoading && leaderboard === undefined) {
    return <div>Loading...</div>;
  }

  // If we have data but it's empty, or if we have no data (but not loading)
  if (!leaderboard || leaderboard.length === 0) {
    return <div>No submissions yet.</div>;
  }

  const isAdmin = game?.adminId === currentUser?.id;
  const currentUserEntry = currentUser ? leaderboard.find(entry => entry.user.id === currentUser.id) : null;
  const currentUserRank = currentUserEntry ? leaderboard.findIndex(entry => entry.user.id === currentUser!.id) + 1 : null;
  
  // Determine how many players to show
  let displayList = leaderboard;
  let showCurrentUserAtEnd = false;
  
  if (maxListed && maxListed < leaderboard.length) {
    displayList = leaderboard.slice(0, maxListed);
    
    // If current user is not in the displayed list and not admin, replace last user
    if (currentUser && !isAdmin && currentUserRank && currentUserRank > maxListed) {
      displayList = [...leaderboard.slice(0, maxListed - 1), currentUserEntry!];
      showCurrentUserAtEnd = true;
    }
  }

  const getPlaceColor = (index: number) => {
    switch (index) {
      case 0: return "var(--yellow)"; // Gold
      case 1: return "var(--light-gray)"; // Silver
      case 2: return "var(--brown)"; // Bronze
      default: return "var(--white)";
    }
  };

  const getRowStyle = (entry: typeof leaderboard[0], index: number) => {
    const isCurrentUser = currentUser?.id === entry.user.id;
    if (isCurrentUser) {
      return { backgroundColor: "var(--dark-gray)", color: "var(--light-cyan)" };
    }
    return {};
  };

  const getActualRank = (entry: typeof leaderboard[0]) => {
    return leaderboard.findIndex(e => e.user.id === entry.user.id) + 1;
  };

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--dark-gray)" }}>Place</th>
            <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--dark-gray)" }}>Username</th>
            <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid var(--dark-gray)" }}>Points</th>
            <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid var(--dark-gray)" }}>Challenges</th>
          </tr>
        </thead>
        <tbody>
          {displayList.map((entry, index) => {
            const actualRank = getActualRank(entry);
            const isCurrentUser = currentUser?.id === entry.user.id;
            const isLastReplaced = showCurrentUserAtEnd && index === displayList.length - 1;
            
            return (
              <tr key={entry.user.id} style={getRowStyle(entry, index)}>
                <td style={{ padding: "0.5rem", color: getPlaceColor(actualRank - 1) }}>
                  {`#${actualRank}`}
                </td>
                <td style={{ padding: "0.5rem", color: isCurrentUser ? "var(--light-cyan)" : "var(--yellow)" }}>
                  {entry.user.username}
                  {isCurrentUser && " (You)"}
                </td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                  {entry.score}
                </td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                  {entry.challengesSolved}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {maxListed && leaderboard.length > maxListed && !showCurrentUserAtEnd && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link 
            href={`/game/${gameId}/leaderboard`}
            style={{ color: "var(--light-blue)", textDecoration: "underline" }}
          >
            Show All ({leaderboard.length} players)
          </Link>
        </div>
      )}
      
      {!maxListed && (
        <div style={{ marginTop: "1rem", textAlign: "center", color: "var(--light-gray)" }}>
          Total Players: {leaderboard.length}
        </div>
      )}
    </div>
  );
}
