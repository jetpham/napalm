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
        name: true,
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
          name: true,
          email: true,
          username: true,
          image: true,
        },
      });
    }),
});
