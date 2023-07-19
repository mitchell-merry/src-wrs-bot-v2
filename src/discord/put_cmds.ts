import { REST, Routes } from "discord.js";
import { commands, hasSubcommands } from "./commands";
import AdminCommand from "./commands/admin";
import { Command, CommandWithSubcommands } from "./commands/command";

export function setupCommands() {
	[ ...commands, AdminCommand ].forEach(cmd => {
		if (!hasSubcommands(cmd))
			return;
		
		cmd.subcommands.forEach(sc => cmd.data.addSubcommand(sc.data));
	})
}

export async function registerAllCommands(guild?: string) {
	const cmds = process.env.DiscordAdminGuild === guild ? [ AdminCommand ] : [ ];
	return registerCommands([ ...cmds, ...commands ], guild);
}

export async function clearCommands(guild?: string) {
	const cmds = process.env.DiscordAdminGuild === guild ? [ AdminCommand ] : [ ];
	return registerCommands(cmds, guild);
}

async function registerCommands(commands: (CommandWithSubcommands | Command)[], guild?: string) {
	if (!process.env.DiscordToken)
		throw new Error("No TOKEN environment variable specified!");

	if (!process.env.DiscordClient)
		throw new Error("No client environment variable specified!");

	console.log(`Registering commands for ${guild}.`);

	const rest = new REST({ version: '9' }).setToken(process.env.DiscordToken);

	setupCommands();
	const commandData = commands.map(command => command.data);

	await rest.put(guild 
			? Routes.applicationGuildCommands(process.env.DiscordClient, guild)
			: Routes.applicationCommands(process.env.DiscordClient),
		{ body: commandData },
	).catch(r => console.log(JSON.stringify(r, null, 2)));

	console.log(`Finished registering commands for ${guild}!`);
}