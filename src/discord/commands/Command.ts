import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { GuildEntity } from "../../db/entities";
import { Autocompleter } from "../autocompleters/Autocompleter";

export type PermissionLevel = 'admin' | 'mods' | 'all';
export type Executer = (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>

export interface Command {
	data: SlashCommandBuilder;
	perm: PermissionLevel;
	execute: Executer;
	autocomplete?: Autocompleter;
}

export interface CommandWithSubcommands {
	data: SlashCommandBuilder;
	subcommands: Subcommand[];	
}

export interface Subcommand {
	data: SlashCommandSubcommandBuilder;
	perm: PermissionLevel;
	execute: Executer;
	autocomplete?: Autocompleter;
}