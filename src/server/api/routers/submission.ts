import { z } from "zod";

import { createTRPCRouter, usernameRequiredProcedure } from "~/server/api/trpc";

export const submissionRouter = createTRPCRouter({
  submit: usernameRequiredProcedure
    .input(
      z.object({
        challengeId: z.string(),
        flag: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get challenge and game info
      const challenge = await ctx.db.challenge.findUnique({
        where: { id: input.challengeId },
        include: {
          game: {
            select: {
              id: true,
              endingTime: true,
            },
          },
        },
      });

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      // Check if game has ended
      if (new Date() > challenge.game.endingTime) {
        throw new Error("Cannot submit to ended games");
      }

      // Check if user already has a correct submission for this challenge
      const existingCorrectSubmission = await ctx.db.submission.findFirst({
        where: {
          challengeId: input.challengeId,
          userId: ctx.session.user.id,
          flag: challenge.flag,
        },
      });

      if (existingCorrectSubmission) {
        throw new Error("Already solved this challenge");
      }

      // Check if user has already submitted this exact flag
      const existingSubmissionWithSameFlag = await ctx.db.submission.findFirst({
        where: {
          challengeId: input.challengeId,
          userId: ctx.session.user.id,
          flag: input.flag,
        },
      });

      if (existingSubmissionWithSameFlag) {
        throw new Error("You have already submitted this flag");
      }

      // Always create a new submission
      const submission = await ctx.db.submission.create({
        data: {
          flag: input.flag,
          userId: ctx.session.user.id,
          challengeId: input.challengeId,
        },
      });

      // Check if the submission is correct
      if (input.flag !== challenge.flag) {
        throw new Error("Incorrect flag");
      }

      return submission;
    }),

  getByUserAndGame: usernameRequiredProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.submission.findMany({
        where: {
          userId: ctx.session.user.id,
          challenge: {
            gameId: input.gameId,
          },
        },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              pointValue: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getByChallenge: usernameRequiredProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.submission.findFirst({
        where: {
          challengeId: input.challengeId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
