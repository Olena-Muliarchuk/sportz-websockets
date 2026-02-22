import { EntitySchema } from 'typeorm';
import { MatchStatus } from './constants.js';

export const MatchSchema = new EntitySchema({
    name: 'Match',
    tableName: 'matches',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        sport: {
            type: 'varchar',
        },
        homeTeam: {
            type: 'varchar',
            name: 'home_team',
        },
        awayTeam: {
            type: 'varchar',
            name: 'away_team',
        },
        status: {
            type: 'enum',
            enum: Object.values(MatchStatus),
            default: MatchStatus.SCHEDULED,
        },
        startTime: {
            type: 'timestamp',
            name: 'start_time',
            nullable: true,
        },
        endTime: {
            type: 'timestamp',
            name: 'end_time',
            nullable: true,
        },
        homeScore: {
            type: 'int',
            name: 'home_score',
            default: 0,
        },
        awayScore: {
            type: 'int',
            name: 'away_score',
            default: 0,
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            createDate: true,
        },
    },
    relations: {
        commentaries: {
            type: 'one-to-many',
            target: 'Commentary',
            inverseSide: 'match',
        },
    },
});
