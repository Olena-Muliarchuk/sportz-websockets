import { z } from 'zod';

/**
 * Validates query parameters for fetching commentary logs.
 * Coerces the limit from a string to a number for Express compatibility.
 */
export const listCommentaryQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Validates the payload for creating a new commentary entry.
 * Designed to support high-frequency real-time updates.
 */
export const createCommentarySchema = z.object({
    minute: z.coerce.number().int().nonnegative().optional(),
    sequence: z.coerce.number().int().nonnegative(),
    period: z.string().trim().min(1, { error: 'Period is required' }),
    eventType: z.string().trim().min(1, { error: 'Event type is required' }),
    actor: z.string().trim().optional(),
    team: z.string().trim().optional(),
    message: z
        .string()
        .trim()
        .min(1, { error: 'Commentary message is required' }),
    metadata: z.record(z.string(), z.unknown()).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
});
