import 'dotenv/config';
import { registerAllCommands } from '../discord/put_cmds';

if(!process.env.TOKEN || !process.env.client)
	throw new Error('TOKEN and client environment variables are required.');

console.log('Started refreshing application (/) commands.');

registerAllCommands(process.env.guild)
	.then(() => console.log('Successfully reloaded application (/) commands.'))
	.catch(error => console.error(error));