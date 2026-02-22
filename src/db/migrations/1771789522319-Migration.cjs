/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Migration1771789522319 {
    name = 'Migration1771789522319'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('scheduled', 'live', 'finished')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" SERIAL NOT NULL, "sport" character varying NOT NULL, "home_team" character varying NOT NULL, "away_team" character varying NOT NULL, "status" "public"."matches_status_enum" NOT NULL DEFAULT 'scheduled', "start_time" TIMESTAMP, "end_time" TIMESTAMP, "home_score" integer NOT NULL DEFAULT '0', "away_score" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "commentary" ("id" SERIAL NOT NULL, "match_id" integer NOT NULL, "minute" integer, "sequence" integer NOT NULL, "period" character varying NOT NULL, "event_type" character varying NOT NULL, "actor" character varying, "team" character varying, "message" text NOT NULL, "metadata" jsonb, "tags" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_465979b97c47c504d1032b0e757" PRIMARY KEY ("id")); COMMENT ON COLUMN "commentary"."sequence" IS 'Used to maintain order of events within the same minute'; COMMENT ON COLUMN "commentary"."period" IS 'e.g., 1H, 2H, OT'; COMMENT ON COLUMN "commentary"."event_type" IS 'e.g., goal, yellow_card, substitution'; COMMENT ON COLUMN "commentary"."actor" IS 'The player or official involved'`);
        await queryRunner.query(`ALTER TABLE "commentary" ADD CONSTRAINT "FK_6ec2a8e5361c0b16a6a42d4be71" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "commentary" DROP CONSTRAINT "FK_6ec2a8e5361c0b16a6a42d4be71"`);
        await queryRunner.query(`DROP TABLE "commentary"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
    }
}
