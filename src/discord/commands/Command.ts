import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { PermissionLevel } from ".";
import { GuildEntity } from "../../db/entities";

export abstract class Command {
	static data: SlashCommandBuilder;
	static perm: PermissionLevel;
	static execute: (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>;
	static autocomplete: (interaction: AutocompleteInteraction) => Promise<void>;

	static getData(): SlashCommandBuilder { return this.data; }
}

export abstract class CommandWithSubcommands extends Command {
	static subcommands: (typeof Subcommand)[]

	static async execute(interaction: CommandInteraction, guildEnt: GuildEntity) {
		const sc = this.subcommands.find(sc => sc.data.name === interaction.options.getSubcommand());
		if(!sc) throw new Error(`Invalid subcommand: ${interaction.options.getSubcommand()}`);

		sc.execute(interaction, guildEnt);
	}

	static getData() {
		const newData = this.data;
		this.subcommands.forEach(sc => newData.addSubcommand(sc.data));
		return newData;
	}
}

export abstract class Subcommand {
	static data: SlashCommandSubcommandBuilder;
	static perms: PermissionLevel;
	static execute: (interaction: CommandInteraction, guildEnt: GuildEntity) => Promise<void>;
	static autocomplete: (interaction: AutocompleteInteraction) => Promise<void>;


}