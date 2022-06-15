/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents, Interaction, User } from 'discord.js'

import { DB, isUserMod, synchronizeGuilds } from './db'
import { commands, CommandFile } from './discord';
import { ModeratorRole } from './db/models';
import UserError from './discord/UserError';

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

		if(!command) throw new Error(`Command ${interaction.commandName} unknown`);

		// Get the perm level of the command or subcommand.
		let permLevel;
		if(typeof command.perms === 'string') permLevel = command.perms;
		else permLevel = command.perms[interaction.options.getSubcommand()];
		
		if(!permLevel) throw new Error(`Permission level missing for ${interaction.options.getSubcommand()}.`);

		const userIsAdmin = interaction.user.id === process.env.admin;
		const userIsMod = userIsAdmin || (await isUserMod(interaction.guildId, interaction.member));

		// Check user has correct permission.
		if(permLevel === 'admin' && !userIsAdmin) throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);
		else if(permLevel === 'mods' && !userIsMod) throw new UserError(`Only mods and above are allowed to use this! Shame on you. Bad.`);

		await command.execute(interaction);
	} catch (error) {
		if(error instanceof UserError) {
			await (interaction.replied || interaction.deferred 
				? interaction.editReply(error.message) 
				: interaction.reply(error.message));
		} else {
			console.error(error);
			const msg = {
				content: "Unknown error occurred.",
				components: []
			};
			
			await (interaction.replied || interaction.deferred 
				? interaction.editReply(msg) 
				: interaction.reply(msg));
		}
		
	}    
});