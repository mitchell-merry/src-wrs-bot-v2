import { REST, Routes } from "discord.js";
import { commands, hasSubcommands } from "./commands";
import AdminCommand from "./commands/admin";
import { Command, CommandWithSubcommands } from "./commands/command";

export async function registerAllCommands(guild?: string) {
	const cmds = process.env.guild === guild ? [ AdminCommand ] : [ ];
	return registerCommands([ ...cmds, ...commands ], guild);
}

export async function clearCommands(guild?: string) {
	const cmds = process.env.guild === guild ? [ AdminCommand ] : [ ];
	return registerCommands(cmds, guild);
}

async function registerCommands(commands: (CommandWithSubcommands | Command)[], guild?: string) {
	if (!process.env.TOKEN)
		throw new Error("No TOKEN environment variable specified!");

	if (!process.env.client)
		throw new Error("No client environment variable specified!");

	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

	const commandData = commands.map(command => {
		if (!hasSubcommands(command)) return command.data;
	
		const newData = command.data;
		command.subcommands.forEach(sc => newData.addSubcommand(sc.data));
		return newData;
	});

	rest.put(guild 
			? Routes.applicationGuildCommands(process.env.client, guild)
			: Routes.applicationCommands(process.env.client),
		{ body: commandData },
	);
}