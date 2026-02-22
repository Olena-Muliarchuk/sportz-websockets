import { EntitySchema } from 'typeorm';

export const CommentarySchema = new EntitySchema({
    name: 'Commentary',
    tableName: 'commentary',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        matchId: {
            type: 'int',
            name: 'match_id',
        },
        minute: {
            type: 'int',
            nullable: true,
        },
        sequence: {
            type: 'int',
            comment: 'Used to maintain order of events within the same minute',
        },
        period: {
            type: 'varchar',
            comment: 'e.g., 1H, 2H, OT',
        },
        eventType: {
            type: 'varchar',
            name: 'event_type',
            comment: 'e.g., goal, yellow_card, substitution',
        },
        actor: {
            type: 'varchar',
            nullable: true,
            comment: 'The player or official involved',
        },
        team: {
            type: 'varchar',
            nullable: true,
        },
        message: {
            type: 'text',
        },
        metadata: {
            type: 'jsonb',
            nullable: true,
        },
        tags: {
            type: 'simple-array',
            nullable: true,
        },
        createdAt: {
            type: 'timestamp',
            name: 'created_at',
            createDate: true,
        },
    },
    relations: {
        match: {
            type: 'many-to-one',
            target: 'Match',
            joinColumn: { name: 'match_id' },
            onDelete: 'CASCADE',
        },
    },
});
