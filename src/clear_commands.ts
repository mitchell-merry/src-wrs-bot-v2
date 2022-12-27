import { REST, Routes } from 'discord.js';
import 'dotenv/config';

if(!process.env.TOKEN || !process.env.client) throw new Error('TOKEN and client environment variables are required.');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

console.log('Started clearing application (/) commands.');

rest.put(
	process.env.guild 
		? Routes.applicationGuildCommands(process.env.client, process.env.guild)
		: Routes.applicationCommands(process.env.client),
	{ body: [] },
).then(() => console.log('Successfully cleared application (/) commands.'))
.catch(error => console.error(error));