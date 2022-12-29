import 'dotenv/config';
import { clearCommands } from '../discord/put_cmds';

if(!process.env.TOKEN || !process.env.client)
	throw new Error('TOKEN and client environment variables are required.');

console.log('Started refreshing application (/) commands.');

clearCommands(process.env.guild)
	.then(() => console.log('Successfully cleared application (/) commands.'))
	.catch(error => console.error(error));