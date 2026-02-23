import { Router } from 'express';
import { matchIdParamSchema } from '../validation/matches.js';
import {
    createCommentarySchema,
    listCommentaryQuerySchema,
} from '../validation/commentary.js';
import { CommentarySchema } from '../db/schemas/index.js';
import AppDataSource from '../db/data-source.js';

const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get('/', async (req, res) => {
    const paramParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
        return res.status(400).json({
            error: 'Invalid match ID',
            details: paramParsed.error.issues,
        });
    }

    const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
        return res.status(400).json({
            error: 'Invalid query parameters',
            details: queryParsed.error.issues,
        });
    }

    const { id: matchId } = paramParsed.data;
    const { limit = MAX_LIMIT } = queryParsed.data;
    const safeLimit = Math.min(limit, MAX_LIMIT);

    try {
        const commentaries = await AppDataSource.createQueryBuilder()
            .select('commentary')
            .from(CommentarySchema, 'commentary')
            .where('commentary.match_id = :matchId', { matchId })
            .orderBy('commentary.created_at', 'DESC')
            .limit(safeLimit)
            .getMany();

        return res.status(200).json({ data: commentaries });
    } catch (error) {
        console.error('Error fetching commentary log:', error);
        return res
            .status(500)
            .json({ error: 'Failed to retrieve match commentary' });
    }
});

commentaryRouter.post('/', async (req, res) => {
    const paramParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
        return res.status(400).json({
            error: 'Invalid match ID',
            details: paramParsed.error.issues,
        });
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body);
    if (!bodyParsed.success) {
        return res.status(400).json({
            error: 'Invalid commentary payload',
            details: bodyParsed.error.issues,
        });
    }

    const { id: matchId } = paramParsed.data;

    try {
        const insertResult = await AppDataSource.createQueryBuilder()
            .insert()
            .into(CommentarySchema)
            .values({ ...bodyParsed.data, matchId })
            .returning('*')
            .execute();

        const newCommentary = insertResult.generatedMaps[0];

        if (res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(
                newCommentary.matchId,
                newCommentary,
            );
        }

        return res.status(201).json({ data: newCommentary });
    } catch (error) {
        console.error('Failed to create commentary:', error);

        if (error.code === '23503') {
            return res.status(404).json({ error: 'Match not found' });
        }

        return res.status(500).json({ error: 'Failed to create commentary' });
    }
});
