import { MigrationInterface, QueryRunner } from "typeorm";

export class PlayerGuild1665449596693 implements MigrationInterface {
    name = 'PlayerGuild1665449596693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`player\` ADD \`guild_id\` varchar(255) NOT NULL`);
		await queryRunner.query('UPDATE \`player\` SET \`guild_id\` = 869351378726846494');
        await queryRunner.query(`ALTER TABLE \`player\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`player\` ADD PRIMARY KEY (\`player_id\`, \`guild_id\`)`);
        await queryRunner.query(`ALTER TABLE \`player\` ADD CONSTRAINT \`FK_46e0ad82ac88f5b9f29b7b6b729\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guild\`(\`guild_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`player\` DROP FOREIGN KEY \`FK_46e0ad82ac88f5b9f29b7b6b729\``);
        await queryRunner.query(`ALTER TABLE \`player\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`player\` ADD PRIMARY KEY (\`player_id\`)`);
        await queryRunner.query(`ALTER TABLE \`player\` DROP COLUMN \`guild_id\``);
    }

}
