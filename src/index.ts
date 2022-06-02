/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents, Interaction } from 'discord.js'

import { DB, isUserMod, synchronizeGuilds } from './db'
import commands, { CommandFile } from './commands';
import { ModeratorRole } from './db/models';

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS ] });
let commandDict: Record<string, CommandFile> = {};

client.on('ready', async () => {
	if(!client.user) throw new Error(`Null client.user? ${client}`);
	
	// Log guilds bot is in on startup
	console.log(`Logged in as ${client.user.tag} and in the following Guilds: [${client.guilds.cache.size}]`);
	client.guilds.cache.forEach(g => {
		console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
	});

	commandDict = Object.fromEntries(commands.map(command => [command.data.name, command]));

	// Initialise database
	await DB.initialize()
		.then(() => console.log("Data Source has been initialized!"))
		.catch(err => console.error("Error during Data Source initialization", err));

	// Add guilds bot doesn't currently track to database
	await synchronizeGuilds(client.guilds);

	console.log(`Bot is ready.`);
});

client.login(process.env.TOKEN);

client.on('interactionCreate', async (interaction: Interaction) => {
	if (!interaction.isCommand()) return;

	const command = commandDict[interaction.commandName];

	try {

		if(!command)
		{
			interaction.reply(`Command ${interaction.commandName} unknown`);
			return;
		}

		// Get the perm level of the command or subcommand.
		let permLevel;
		if(typeof command.perms === 'string') permLevel = command.perms;
		else permLevel = command.perms[interaction.options.getSubcommand()];
		
		if(!permLevel) throw new Error(`Permission level missing for ${interaction.options.getSubcommand()}.`);

		// Check user has correct permission.
		if(permLevel === 'admin' && interaction.user.id !== process.env.admin)
		{
			interaction.reply(`Only admins are allowed to use this command! Loser. Scram!!`);
			return;
		}
		else if(permLevel === 'mods' && !(await isUserMod(interaction.guildId, interaction.member)))
		{
			interaction.reply(`Only mods and above are allowed to use this! Shame on you. Bad.`);
			return;
		}


		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		const msg = { content: `${error}` };
		await (interaction.replied || interaction.deferred 
			? interaction.editReply(msg) 
			: interaction.reply(msg));
	}    
});