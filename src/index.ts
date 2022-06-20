/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents, Interaction } from 'discord.js'

import { DB, isUserMod, synchronizeGuilds } from './db'
import { commands, CommandFile, handleSlashCommand, handleAutocomplete } from './discord';
import { GuildEntity, TrackedLeaderboardEntity } from './db/models';
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
	if(interaction.isCommand()) await handleSlashCommand(interaction);
	if(interaction.isAutocomplete()) await handleAutocomplete(interaction); 
});

client.on('guildCreate', async guild => {
	const gRepo = DB.getRepository(GuildEntity);
	console.log(`Joined ${guild.name}, synchronising...`);
	await gRepo.save(new GuildEntity(guild.id));
});

client.on('guildDelete', async guild => {
	const gRepo = DB.getRepository(GuildEntity);
	const g = await gRepo.findOne({ where: { guild_id: guild.id } });
	if(g) {
		console.log(`Left ${guild.name}, synchronising...`);
		await gRepo.delete({ guild_id: guild.id });
	}
});