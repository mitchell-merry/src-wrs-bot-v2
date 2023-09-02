import 'dotenv/config';
import { registerAllCommands } from '../discord/put_cmds';

if (!process.env.DiscordToken || !process.env.DiscordClient)
    throw new Error('TOKEN and client environment variables are required.');

console.log('Started refreshing application (/) commands.');

registerAllCommands(process.env.DiscordAdminGuild)
    .then(() => console.log('Successfully reloaded application (/) commands.'))
    .catch(error => console.error(error));
