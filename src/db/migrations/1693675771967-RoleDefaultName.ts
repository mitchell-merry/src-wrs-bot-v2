import { MigrationInterface, QueryFailedError, QueryRunner } from 'typeorm';

export class RoleDefaultName1693675771967 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(
                `ALTER TABLE \`guild\` ADD \`role_default_name\` varchar(255) NOT NULL`,
            );
            await queryRunner.query(
                'UPDATE `guild` SET `role_default_name` = ""',
            );
        } catch (e) {
            // TODO LOL!
            if (!(e instanceof QueryFailedError)) {
                throw e;
            }
            console.log(`IGNORING: ` + e);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`guild\` DROP COLUMN \`role_default_name\``,
        );
    }
}
