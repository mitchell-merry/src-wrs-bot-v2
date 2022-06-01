/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents, Interaction } from 'discord.js'

import { DB, synchronizeGuilds } from './db'
import commands, { CommandFile } from './commands';

const client = new Client({ intents: [ Intents.FLAGS.GUILDS ] });
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

	if(!commandDict[interaction.commandName])
	{
		console.log(`Command ${interaction.commandName} unknown`);
		return;
	}

	try {
        await interaction.deferReply();
		await commandDict[interaction.commandName].execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: "Error checkm consle baby." });
	}    
});