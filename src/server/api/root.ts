import { accountRouter } from "~/server/api/routers/account";
import { challengeRouter } from "~/server/api/routers/challenge";
import { gameRouter } from "~/server/api/routers/game";
import { inviteRouter } from "~/server/api/routers/invite";
import { submissionRouter } from "~/server/api/routers/submission";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  account: accountRouter,
  game: gameRouter,
  challenge: challengeRouter,
  submission: submissionRouter,
  invite: inviteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
