import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const challengeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        flag: z.string().min(1),
        pointValue: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if game has ended
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { endingTime: true, adminId: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (new Date() > game.endingTime) {
        throw new Error("Cannot create challenges for ended games");
      }

      // Check if user is admin
      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can create challenges");
      }

      return ctx.db.challenge.create({
        data: {
          title: input.title,
          description: input.description,
          flag: input.flag,
          pointValue: input.pointValue,
          gameId: input.gameId,
        },
      });
    }),

  getByGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      const challenges = await ctx.db.challenge.findMany({
        where: { gameId: input.gameId },
        orderBy: { pointValue: "asc" },
        include: {
          submissions: {
            where: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      return challenges.map((challenge) => ({
        ...challenge,
        hasCorrectSubmission: challenge.submissions.some(
          (sub) => sub.flag === challenge.flag,
        ),
      }));
    }),

  getFlag: protectedProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const challenge = await ctx.db.challenge.findUnique({
        where: { id: input.challengeId },
        include: {
          game: {
            select: {
              adminId: true,
              endingTime: true,
            },
          },
        },
      });

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      // Check if user is admin or has correct submission
      const isAdmin = challenge.game.adminId === ctx.session.user.id;
      const userSubmission = await ctx.db.submission.findFirst({
        where: {
          challengeId: input.challengeId,
          userId: ctx.session.user.id,
        },
      });

      const hasCorrectSubmission =
        userSubmission && userSubmission.flag === challenge.flag;

      if (!isAdmin && !hasCorrectSubmission) {
        throw new Error("Not authorized to view flag");
      }

      return challenge.flag;
    }),
});
