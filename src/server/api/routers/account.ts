import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
  // Check if a username is available
  checkUsername: publicProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be 20 characters or less")
          .regex(
            /^[a-zA-Z0-9]+$/,
            "Username can only contain letters and numbers",
          ),
      }),
    )
    .query(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      return {
        available: !existingUser,
        username: input.username,
      };
    }),

  // Get current user's account info
  getMe: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        image: true,
      },
    });
  }),

  // Set/Update username for current user
  updateUsername: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be 20 characters or less")
          .regex(
            /^[a-zA-Z0-9]+$/,
            "Username can only contain letters and numbers",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username is already taken by another user
      const existingUser = await ctx.db.user.findFirst({
        where: {
          username: input.username,
          id: { not: ctx.session.user.id },
        },
      });

      if (existingUser) {
        throw new Error("Username is already taken");
      }

      // Update user's username
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { username: input.username },
        select: {
          id: true,
          username: true,
          image: true,
        },
      });
    }),

  // Get account statistics for current user
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get total games hosted
    const totalGamesHosted = await ctx.db.game.count({
      where: { adminId: userId },
    });

    // Get total games played (excluding games where user is admin)
    const totalGamesPlayed = await ctx.db.gameParticipant.count({
      where: {
        userId,
        game: {
          adminId: { not: userId },
        },
      },
    });

    // Get first joined date
    const firstJoined = await ctx.db.gameParticipant.findFirst({
      where: { userId },
      orderBy: { joinedAt: "asc" },
      select: { joinedAt: true },
    });

    return {
      totalGamesHosted,
      totalGamesPlayed,
      firstJoined: firstJoined?.joinedAt ?? null,
    };
  }),
});
