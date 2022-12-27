import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { commands, hasSubcommands } from './discord';

if(!process.env.TOKEN || !process.env.client) throw new Error('TOKEN and client environment variables are required.');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
const commandData = commands.map(command => {
	if (!hasSubcommands(command)) return command.data;

	const newData = command.data;
	command.subcommands.forEach(sc => newData.addSubcommand(sc.data));
	return newData;
});

console.log('Started refreshing application (/) commands.');

rest.put(
	process.env.guild 
		? Routes.applicationGuildCommands(process.env.client, process.env.guild)
		: Routes.applicationCommands(process.env.client),
	{ body: commandData },
).then(() => console.log('Successfully reloaded application (/) commands.'))
.catch(error => console.error(error));