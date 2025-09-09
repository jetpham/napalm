import { z } from "zod";
import { randomBytes } from "crypto";
import { InviteStatus } from "@prisma/client";

import {
  createTRPCRouter,
  publicProcedure,
  usernameRequiredProcedure,
} from "~/server/api/trpc";

export const inviteRouter = createTRPCRouter({
  // Create a user invite for a game
  createUserInvite: usernameRequiredProcedure
    .input(
      z.object({
        gameId: z.string(),
        username: z.string().min(3).max(20),
        message: z.string().optional(),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if game exists and user is admin
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true, title: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can create invites");
      }

      // Check if the target username exists
      const targetUser = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true, username: true },
      });

      if (!targetUser) {
        throw new Error("User with this username does not exist");
      }

      // Check if invite already exists for this user and game
      const existingInvite = await ctx.db.userInvite.findFirst({
        where: {
          invitedUserId: targetUser.id,
          gameId: input.gameId,
          status: InviteStatus.PENDING,
        },
      });

      if (existingInvite) {
        throw new Error("Invite already exists for this user");
      }

      // Create the invite
      const invite = await ctx.db.userInvite.create({
        data: {
          invitedUserId: targetUser.id,
          message: input.message,
          expiresAt: input.expiresAt,
          invitedById: ctx.session.user.id,
          gameId: input.gameId,
        },
        include: {
          game: {
            select: {
              id: true,
              title: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              username: true,
            },
          },
          invitedUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return invite;
    }),

  // Create an invite link for a game
  createInviteLink: usernameRequiredProcedure
    .input(
      z.object({
        gameId: z.string(),
        message: z.string().optional(),
        expiresAt: z.date().optional(),
        isSingleUse: z.boolean().default(false), // Whether the link can only be used once
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if game exists and user is admin
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true, title: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can create invite links");
      }

      // Generate a unique invite code
      const inviteCode = randomBytes(16).toString("hex");

      // Create the invite link
      const invite = await ctx.db.inviteLink.create({
        data: {
          inviteCode: inviteCode,
          message: input.message,
          expiresAt: input.expiresAt,
          isUsed: input.isSingleUse ? false : null, // null = no limit, false = unused, true = used
          invitedById: ctx.session.user.id,
          gameId: input.gameId,
        },
        include: {
          game: {
            select: {
              id: true,
              title: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        ...invite,
        inviteUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/invite/${inviteCode}`,
        isSingleUse: input.isSingleUse,
      };
    }),

  // Get invites for a specific game (admin only)
  getByGame: usernameRequiredProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin of the game
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can view invites");
      }

      const [userInvites, inviteLinks] = await Promise.all([
        ctx.db.userInvite.findMany({
          where: { gameId: input.gameId },
          include: {
            invitedBy: {
              select: {
                id: true,
                username: true,
              },
            },
            acceptedBy: {
              select: {
                id: true,
                username: true,
              },
            },
            invitedUser: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.inviteLink.findMany({
          where: { gameId: input.gameId },
          include: {
            invitedBy: {
              select: {
                id: true,
              },
            },
            usedBy: {
              select: {
                id: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        userInvites,
        inviteLinks,
      };
    }),

  // Get user invites for the current user
  getMyUserInvites: usernameRequiredProcedure.query(async ({ ctx }) => {
    return ctx.db.userInvite.findMany({
      where: {
        invitedUserId: ctx.session.user.id,
        status: InviteStatus.PENDING,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            endingTime: true,
            isPublic: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get invite link details by code (public)
  getInviteLink: publicProcedure
    .input(z.object({ inviteCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.inviteLink.findUnique({
        where: { inviteCode: input.inviteCode },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              endingTime: true,
              isPublic: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!invite) {
        throw new Error("Invalid invite link");
      }

      if (invite.status !== InviteStatus.PENDING) {
        if (invite.status === InviteStatus.USED) {
          throw new Error("Invite link has already been used");
        }
        if (invite.status === InviteStatus.DELETED) {
          throw new Error("Invite link has been deleted");
        }
        throw new Error("Invite link is no longer valid");
      }

      if (invite.expiresAt && new Date() > invite.expiresAt) {
        throw new Error("Invite link has expired");
      }

      return {
        ...invite,
        isSingleUse: invite.isUsed !== null, // If isUsed is not null, it's a single-use link
      };
    }),

  // Accept a user invite
  acceptUserInvite: usernameRequiredProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.userInvite.findUnique({
        where: { id: input.inviteId },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              endingTime: true,
              isPublic: true,
            },
          },
        },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      if (invite.invitedUserId !== ctx.session.user.id) {
        throw new Error("This invite is not for you");
      }

      if (invite.status !== InviteStatus.PENDING) {
        throw new Error("Invite is no longer valid");
      }

      if (invite.expiresAt && new Date() > invite.expiresAt) {
        throw new Error("Invite has expired");
      }

      // Check if game has ended
      if (new Date() > invite.game.endingTime) {
        throw new Error("Cannot join ended games");
      }

      // Check if user is already a participant
      const existingParticipant = await ctx.db.gameParticipant.findUnique({
        where: {
          userId_gameId: {
            userId: ctx.session.user.id,
            gameId: invite.gameId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error("You are already a participant in this game");
      }

      // Use transaction to update invite and add participant
      return ctx.db.$transaction(async (tx) => {
        // Update invite status
        const updatedInvite = await tx.userInvite.update({
          where: { id: input.inviteId },
          data: {
            status: InviteStatus.ACCEPTED,
            acceptedById: ctx.session.user.id,
            acceptedAt: new Date(),
          },
        });

        // Add user as participant
        await tx.gameParticipant.create({
          data: {
            userId: ctx.session.user.id,
            gameId: invite.gameId,
          },
        });

        return updatedInvite;
      });
    }),

  // Accept an invite link
  acceptInviteLink: usernameRequiredProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.inviteLink.findUnique({
        where: { inviteCode: input.inviteCode },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              endingTime: true,
              isPublic: true,
            },
          },
        },
      });

      if (!invite) {
        throw new Error("Invalid invite link");
      }

      if (invite.status !== InviteStatus.PENDING) {
        if (invite.status === InviteStatus.USED) {
          throw new Error("Invite link has already been used");
        }
        if (invite.status === InviteStatus.DELETED) {
          throw new Error("Invite link has been deleted");
        }
        throw new Error("Invite link is no longer valid");
      }

      if (invite.expiresAt && new Date() > invite.expiresAt) {
        throw new Error("Invite link has expired");
      }

      // Check if game has ended
      if (new Date() > invite.game.endingTime) {
        throw new Error("Cannot join ended games");
      }

      // Check if user is already a participant
      const existingParticipant = await ctx.db.gameParticipant.findUnique({
        where: {
          userId_gameId: {
            userId: ctx.session.user.id,
            gameId: invite.gameId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error("You are already a participant in this game");
      }

      // Use transaction to update invite and add participant
      return ctx.db.$transaction(async (tx) => {
        // Update invite link - mark as used if it's a single-use link
        const updateData: {
          usedById: string;
          usedAt: Date;
          isUsed?: boolean;
          status?: InviteStatus;
        } = {
          usedById: ctx.session.user.id,
          usedAt: new Date(),
        };

        // If it's a single-use link (isUsed is false), mark it as used
        if (invite.isUsed === false) {
          updateData.isUsed = true;
          updateData.status = InviteStatus.USED;
        }

        const updatedInvite = await tx.inviteLink.update({
          where: { inviteCode: input.inviteCode },
          data: updateData,
        });

        // Add user as participant
        await tx.gameParticipant.create({
          data: {
            userId: ctx.session.user.id,
            gameId: invite.gameId,
          },
        });

        return updatedInvite;
      });
    }),

  // Decline a user invite
  declineUserInvite: usernameRequiredProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.userInvite.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      if (invite.invitedUserId !== ctx.session.user.id) {
        throw new Error("This invite is not for you");
      }

      if (invite.status !== InviteStatus.PENDING) {
        throw new Error("Invite is no longer valid");
      }

      return ctx.db.userInvite.update({
        where: { id: input.inviteId },
        data: { status: "DECLINED" },
      });
    }),

  // Cancel a user invite (admin only)
  cancelUserInvite: usernameRequiredProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.userInvite.findUnique({
        where: { id: input.inviteId },
        include: {
          game: {
            select: { adminId: true },
          },
        },
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      if (invite.game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can cancel invites");
      }

      if (invite.status !== InviteStatus.PENDING) {
        throw new Error("Cannot cancel non-pending invites");
      }

      return ctx.db.userInvite.update({
        where: { id: input.inviteId },
        data: { status: InviteStatus.DELETED },
      });
    }),

  // Cancel an invite link (admin only)
  cancelInviteLink: usernameRequiredProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.inviteLink.findUnique({
        where: { id: input.inviteId },
        include: {
          game: {
            select: { adminId: true },
          },
        },
      });

      if (!invite) {
        throw new Error("Invite link not found");
      }

      if (invite.game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can cancel invite links");
      }

      if (invite.status !== InviteStatus.PENDING) {
        throw new Error("Cannot cancel non-pending invite links");
      }

      return ctx.db.inviteLink.update({
        where: { id: input.inviteId },
        data: { status: InviteStatus.DELETED },
      });
    }),

  // Bulk invite by username list
  bulkUserInvite: usernameRequiredProcedure
    .input(
      z.object({
        gameId: z.string(),
        usernames: z.array(z.string().min(3).max(20)),
        message: z.string().optional(),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if game exists and user is admin
      const game = await ctx.db.game.findUnique({
        where: { id: input.gameId },
        select: { adminId: true, title: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new Error("Only game admin can create invites");
      }

      const results = [];
      const errors = [];

      for (const username of input.usernames) {
        try {
          // Check if the target username exists
          const targetUser = await ctx.db.user.findUnique({
            where: { username },
            select: { id: true, username: true },
          });

          if (!targetUser) {
            errors.push({
              username,
              error: "User with this username does not exist",
            });
            continue;
          }

          // Check if invite already exists
          const existingInvite = await ctx.db.userInvite.findFirst({
            where: {
              invitedUserId: targetUser.id,
              gameId: input.gameId,
              status: InviteStatus.PENDING,
            },
          });

          if (existingInvite) {
            errors.push({ username, error: "Invite already exists" });
            continue;
          }

          // Create invite
          const invite = await ctx.db.userInvite.create({
            data: {
              invitedUserId: targetUser.id,
              message: input.message,
              expiresAt: input.expiresAt,
              invitedById: ctx.session.user.id,
              gameId: input.gameId,
            },
          });

          results.push(invite);
        } catch (error) {
          errors.push({
            username,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return { results, errors };
    }),
});
