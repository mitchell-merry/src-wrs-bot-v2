import * as SRC from 'src-ts';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import UserError from '../../UserError';
import { Subcommand } from '../command';
import { PlayerEntity } from '../../../db/entities';
import { DB } from '../../../db';

const PlayerAddCommand: Subcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add a player association.')
        .addUserOption(o =>
            o
                .setName('user')
                .setDescription('The discord account.')
                .setRequired(true),
        )
        .addStringOption(o =>
            o
                .setName('src_account')
                .setDescription('The speedrun.com username.')
                .setRequired(true),
        ),
    perm: 'mods',
    execute: async (interaction, guildEnt) => {
        const userOpt = interaction.options.getUser('user', true);
        const srcOpt = interaction.options.getString('src_account', true);

        if (guildEnt.players.find(p => p.discord_id === userOpt.id))
            throw new UserError(
                `This discord account is already associated with a speedrun.com account.`,
            );

        const player = await SRC.getUser(srcOpt);
        if (guildEnt.players.find(p => p.player_id === player.id))
            throw new UserError(
                `This speedrun.com account is already associated with a discord account.`,
            );

        const playerEnt = new PlayerEntity(
            interaction.guildId!,
            player.id,
            userOpt.id,
            player.names.international,
        );
        await DB.getRepository(PlayerEntity).save(playerEnt);
        await interaction.reply({
            content: `Added association for <@${userOpt.id}> to the speedrun.com account ${player.names.international} [${player.id}]`,
            allowedMentions: { users: [], roles: [] },
        });
    },
};

export default PlayerAddCommand;
