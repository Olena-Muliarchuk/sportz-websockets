import { Router } from 'express';
import {
    createMatchSchema,
    listMatchesQuerySchema,
} from '../validation/matches.js';
import { MatchSchema } from '../db/schemas/index.js';
import AppDataSource from '../db/data-source.js';
import { getMatchStatus } from '../utils/match-status.js';

const MAX_LIMIT = 100;

export const matchRouter = Router();
matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid query',
            details: JSON.stringify(parsed.error),
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
    try {
        const matches = await AppDataSource.createQueryBuilder()
            .select('match')
            .from(MatchSchema, 'match')
            .orderBy('match.created_at', 'DESC')
            .limit(limit)
            .getMany();

        res.status(200).json({ data: matches });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to list match',
        });
    }
});

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: JSON.stringify(parsed.error),
        });
    }

    const { startTime, endTime, homeScore, awayScore, ...rest } = parsed.data;

    try {
        const insertResult = await AppDataSource.createQueryBuilder()
            .insert()
            .into(MatchSchema)
            .values({
                ...rest,
                startTime: startTime,
                endTime: endTime,
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status: getMatchStatus(startTime, endTime),
            })
            .returning('*')
            .execute();

        const newMatch = insertResult.generatedMaps[0];

        res.status(201).json({ data: newMatch });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create match',
            details: JSON.stringify(error),
        });
    }
});
