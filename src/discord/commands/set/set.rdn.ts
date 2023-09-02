import { SlashCommandSubcommandBuilder } from 'discord.js';
import { DB } from '../../../db';
import { GuildEntity } from '../../../db/entities';
import { Subcommand } from '../command';

const SetRoleDefaultNameCommand: Subcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('role_default_name')
        .setDescription(
            'The default name of new roles created by the bot. Should be a templated string.',
        )
        .addStringOption(o =>
            o
                .setName('role_default_name')
                .setDescription('The name.')
                .setRequired(true),
        ),
    perm: 'mods',
    execute: async (interaction, guildEnt) => {
        const name = interaction.options.getString('role_default_name', true);

        await DB.getRepository(GuildEntity).update(
            { guild_id: guildEnt.guild_id },
            { role_default_name: name },
        );

        await interaction.reply(`role_default_name set to \`${name}\`.`);
    },
};

export default SetRoleDefaultNameCommand;
