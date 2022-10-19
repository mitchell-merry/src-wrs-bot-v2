import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { PermissionLevel } from ".";
import { GuildEntity } from "../../db/entities";

export interface Command {
	data: SlashCommandBuilder;
	perm: PermissionLevel;
	execute: (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface CommandWithSubcommands {
	data: SlashCommandBuilder;
	subcommands: Subcommand[];	
}

export interface Subcommand {
	data: SlashCommandSubcommandBuilder;
	perm: PermissionLevel;
	execute: (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
	
	
	// this.subcommands.forEach(sc => this.data.addSubcommand(sc.data));
	// const sc = this.subcommands.find(sc => sc.data.name === interaction.options.getSubcommand());
	// if(!sc) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);
	
	// sc.execute(interaction, guildEnt);