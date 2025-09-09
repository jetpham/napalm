import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  usernameRequiredProcedure,
} from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.game.findMany({
      where: {
        isPublic: true, // Only show public games in the public list
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
        challenges: true,
        _count: {
          select: {
            challenges: true,
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // Get games accessible to the current user (including private games they're invited to)
  getMyGames: usernameRequiredProcedure.query(async ({ ctx }) => {
    // First, get all games that the user has access to
    const games = await ctx.db.game.findMany({
      where: {
        OR: [
          // Public games
          { isPublic: true },
          // Private games where user is admin
          { adminId: ctx.session.user.id },
          // Private games where user is a participant
          {
            participants: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
          // Private games where user has a pending user invite
          {
            userInvites: {
              some: {
                invitedUserId: ctx.session.user.id,
                status: "PENDING",
              },
            },
          },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
        challenges: true,
        participants: {
          where: {
            userId: ctx.session.user.id,
          },
        },
        _count: {
          select: {
            challenges: true,
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user invites for all games
    const gameIds = games.map(game => game.id);
    const userInvites = await ctx.db.userInvite.findMany({
      where: {
        gameId: { in: gameIds },
        invitedUserId: ctx.session.user.id,
        status: "PENDING",
      },
    });

    // Group invites by game ID
    const invitesByGameId = userInvites.reduce((acc, invite) => {
      if (!acc[invite.gameId]) {
        acc[invite.gameId] = [];
      }
      acc[invite.gameId]!.push(invite);
      return acc;
    }, {} as Record<string, typeof userInvites>);

    // Add userInvites to each game
    return games.map(game => ({
      ...game,
      userInvites: invitesByGameId[game.id] || [],
    }));
  }),

  getById: usernameRequiredProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.id },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
          challenges: {
            orderBy: {
              pointValue: "asc",
            },
          },
          participants: {
            where: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      // Check for user invites separately
      const userInvites = await ctx.db.userInvite.findMany({
        where: {
          gameId: input.id,
          invitedUserId: ctx.session.user.id,
          status: "PENDING",
        },
      });

      // Check access permissions
      const hasAccess =
        game.isPublic || // Public game
        game.adminId === ctx.session.user.id || // User is admin
        game.participants.length > 0 || // User is participant
        userInvites.length > 0; // User has pending user invite

      if (!hasAccess) {
        throw new Error("You don't have access to this game");
      }

      return {
        ...game,
        userInvites,
      };
    }),

  create: usernameRequiredProcedure
    .input(
      z.object({
        title: z.string().min(1),
        endingTime: z.date().refine((date) => date > new Date(), {
          message: "Ending time must be in the future",
        }),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Create the game
        const game = await tx.game.create({
          data: {
            title: input.title,
            endingTime: input.endingTime,
            isPublic: input.isPublic,
            adminId: ctx.session.user.id,
          },
          include: {
            admin: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Add admin as a participant
        await tx.gameParticipant.create({
          data: {
            userId: ctx.session.user.id,
            gameId: game.id,
          },
        });

        return game;
      });
    }),

  getLeaderboard: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get all submissions for this game
      const submissions = await ctx.db.submission.findMany({
        where: {
          challenge: {
            gameId: input.gameId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          challenge: {
            select: {
              pointValue: true,
              flag: true,
            },
          },
        },
      });

      // Filter for correct submissions and group by user
      const userScores = new Map<
        string,
        {
          user: { id: string; username: string | null };
          score: number;
          challengesSolved: number;
        }
      >();

      for (const submission of submissions) {
        // Check if submission is correct by comparing flags
        if (submission.flag === submission.challenge.flag) {
          const userId = submission.user.id;
          if (!userScores.has(userId)) {
            userScores.set(userId, {
              user: submission.user,
              score: 0,
              challengesSolved: 0,
            });
          }

          const userScore = userScores.get(userId)!;
          userScore.score += submission.challenge.pointValue;
          userScore.challengesSolved += 1;
        }
      }

      // Convert to array and sort by score
      return Array.from(userScores.values()).sort((a, b) => b.score - a.score);
    }),

  isGameEnded: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { endingTime: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      return new Date() > game.endingTime;
    }),

  // Join a public game
  join: usernameRequiredProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: {
          id: true,
          title: true,
          isPublic: true,
          endingTime: true,
          adminId: true,
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      // Check if game has ended
      if (new Date() > game.endingTime) {
        throw new Error("Cannot join ended games");
      }

      // Check if user is already a participant
      const existingParticipant = await ctx.db.gameParticipant.findUnique({
        where: {
          userId_gameId: {
            userId: ctx.session.user.id,
            gameId: input.gameId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error("You are already a participant in this game");
      }

      // Only allow joining public games
      if (!game.isPublic) {
        throw new Error(
          "This is a private game. You need an invitation to join.",
        );
      }

      return ctx.db.$transaction(async (tx) => {
        // Add user as participant
        await tx.gameParticipant.create({
          data: {
            userId: ctx.session.user.id,
            gameId: input.gameId,
          },
        });

        return { success: true };
      });
    }),

  // Leave a game
  leave: usernameRequiredProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true, title: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      // Check if user is the admin
      if (game.adminId === ctx.session.user.id) {
        throw new Error("Game admin cannot leave the game");
      }

      // Check if user is a participant
      const participant = await ctx.db.gameParticipant.findUnique({
        where: {
          userId_gameId: {
            userId: ctx.session.user.id,
            gameId: input.gameId,
          },
        },
      });

      if (!participant) {
        throw new Error("You are not a participant in this game");
      }

      return ctx.db.$transaction(async (tx) => {
        // Remove user as participant
        await tx.gameParticipant.delete({
          where: {
            userId_gameId: {
              userId: ctx.session.user.id,
              gameId: input.gameId,
            },
          },
        });

        return { success: true };
      });
    }),

  // Get game participants (admin only)
  getParticipants: usernameRequiredProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can view participants");
      }

      return ctx.db.gameParticipant.findMany({
        where: { gameId: input.gameId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });
    }),

  // Update game settings (admin only)
  updateSettings: usernameRequiredProcedure
    .input(
      z.object({
        gameId: z.string(),
        title: z.string().min(1).optional(),
        endingTime: z.date().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can update game settings");
      }

      const updateData: {
        title?: string;
        endingTime?: Date;
        isPublic?: boolean;
      } = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.endingTime !== undefined)
        updateData.endingTime = input.endingTime;
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

      return ctx.db.game.update({
        where: { id: input.gameId },
        data: updateData,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    }),
});
