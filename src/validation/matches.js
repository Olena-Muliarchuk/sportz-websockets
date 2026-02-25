import { z } from 'zod';
import { MatchStatus } from '../db/schemas';

/**
 * Validates query parameters for listing matches.
 * Uses coercion to handle string values from URL search params.
 */
export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Validates route parameters containing a match ID.
 */
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/**
 * Validates the payload for creating a new match.
 * Includes ISO date string validation and chronological consistency.
 */
export const createMatchSchema = z
    .object({
        sport: z.string().trim().min(1, { error: 'Sport is required' }),
        homeTeam: z.string().trim().min(1, { error: 'Home team is required' }),
        awayTeam: z.string().trim().min(1, { error: 'Away team is required' }),
        startTime: z.iso.datetime({ offset: true }),
        endTime: z.iso.datetime({ offset: true }),
        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine(({ startTime, endTime }, ctx) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (end <= start) {
            ctx.addIssue({
                code: 'custom',
                message: 'endTime must be chronologically after startTime',
                path: ['endTime'],
            });
        }
    });

/**
 * Validates the payload for updating a match score.
 */
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
    status: z.enum(Object.values(MatchStatus)).optional(),
});
