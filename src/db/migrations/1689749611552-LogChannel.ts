import { MigrationInterface, QueryFailedError, QueryRunner } from "typeorm"

export class LogChannel1689749611552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE \`guild\` ADD \`log_channel_id\` varchar(255) NOT NULL`);
            await queryRunner.query('UPDATE \`guild\` SET \`log_channel_id\` = ');
        } catch (e) {
            // TODO LOL!
            if (!(e instanceof QueryFailedError)) {
                throw e;
            }
            console.log(`IGNORING: ` + e);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guild\` DROP COLUMN \`log_channel_id\``);
    }

}
