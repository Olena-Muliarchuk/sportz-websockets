import { Router } from 'express';
import {
    createMatchSchema,
    listMatchesQuerySchema,
    matchIdParamSchema,
    updateScoreSchema,
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

matchRouter.patch('/:id/score', async (req, res) => {
    const paramParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
        return res.status(400).json({
            error: 'Invalid match ID',
            details: paramParsed.error.issues,
        });
    }

    const bodyParsed = updateScoreSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        return res.status(400).json({
            error: 'Invalid score payload',
            details: bodyParsed.error.issues,
        });
    }

    const { id: matchId } = paramParsed.data;
    const { homeScore, awayScore, status } = bodyParsed.data;

    try {

        const updateData = { homeScore, awayScore };
        if (status) {
            updateData.status = status;
        }

        const updateResult = await AppDataSource.createQueryBuilder()
            .update(MatchSchema)
            .set(updateData)
            .where('id = :matchId', { matchId })
            .returning('*')
            .execute();

        if (!updateResult.affected || updateResult.affected === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const updatedMatch = updateResult.generatedMaps[0];

       if (req.app.locals.broadcastScoreUpdate) {
           req.app.locals.broadcastScoreUpdate(matchId, {
               homeScore: updatedMatch.home_score || updatedMatch.homeScore,
               awayScore: updatedMatch.away_score || updatedMatch.awayScore,
               status: updatedMatch.status,
           });
       }
        res.status(200).json({ data: updatedMatch });
    } catch (error) {
        console.error('Failed to update score:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});
