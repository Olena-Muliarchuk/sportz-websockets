import { Router } from 'express';
import {
    createMatchSchema,
    listMatchesQuerySchema,
} from '../validation/matches.js';
import { MatchSchema } from '../db/schemas/index.js';
import AppDataSource from '../db/data-source.js';
import { getMatchStatus } from '../utils/match-status.js';

export const matchRouter = Router();

matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid query',
            details: parsed.error.issues,
        });
    }

    const limit = parsed.data.limit ?? 50;

    try {
        const matches = await AppDataSource.createQueryBuilder()
            .select('match')
            .from(MatchSchema, 'match')
            .orderBy('match.created_at', 'DESC')
            .limit(limit)
            .getMany();

        res.status(200).json({ data: matches });
    } catch (error) {
        console.error('Failed to list matches:', error);
        res.status(500).json({ error: 'Failed to list matches' });
    }
});

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: parsed.error.issues,
        });
    }

    const { startTime, endTime, homeScore, awayScore, ...rest } = parsed.data;

    try {
        const insertResult = await AppDataSource.createQueryBuilder()
            .insert()
            .into(MatchSchema)
            .values({
                ...rest,
                startTime,
                endTime,
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status: getMatchStatus(startTime, endTime),
            })
            .returning('*')
            .execute();

        const newMatch = insertResult.generatedMaps[0];

        if (res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(newMatch);
        }

        res.status(201).json({ data: newMatch });
    } catch (error) {
        console.error('Failed to create match:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
});
