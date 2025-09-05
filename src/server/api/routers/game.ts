import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.game.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        challenges: true,
        _count: {
          select: {
            challenges: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.game.findUnique({
        where: { id: input.id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          challenges: {
            orderBy: {
              pointValue: "asc",
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        endingTime: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.game.create({
        data: {
          title: input.title,
          endingTime: input.endingTime,
          adminId: ctx.session.user.id,
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
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
              name: true,
              email: true,
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
          user: { id: string; name: string | null; email: string | null };
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
});
