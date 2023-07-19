import { MigrationInterface, QueryRunner } from "typeorm"

export class LogChannel1689749611552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guild\` ADD \`log_channel\` varchar(255) NOT NULL`);
        await queryRunner.query('UPDATE \`guild\` SET \`log_channel\` = ');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`guild\` DROP COLUMN \`log_channel\``);
    }

}
