import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands } from './discord';

if(!process.env.TOKEN || !process.env.client) throw new Error('TOKEN and client environment variables are required.');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
const commandData = commands.map(command => command.data);

console.log('Started refreshing application (/) commands.');

rest.put(
	process.env.guild 
		? Routes.applicationGuildCommands(process.env.client, process.env.guild)
		: Routes.applicationCommands(process.env.client),
	{ body: commandData },
).then(() => console.log('Successfully reloaded application (/) commands.'))
.catch(error => console.error(error));