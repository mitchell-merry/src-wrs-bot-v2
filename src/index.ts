/** Entry file */
import 'dotenv/config';
import 'reflect-metadata';

import { Client, Intents } from 'discord.js'

import { DB, synchronizeGuilds } from './db'
import { interactionCreate } from './discord';
import { GuildEntity } from './db/entities';

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS ] });

client.on('ready', async () => {
	if(!client.user) throw new Error(`Null client.user? ${client}`);
	
	// Log guilds bot is in on startup
	console.log(`Logged in as ${client.user.tag} and in the following Guilds: [${client.guilds.cache.size}]`);
	client.guilds.cache.forEach(g => {
		console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
	});

	let retries = 5;
	while (retries)
	{
		try {
			// Initialise database
			await DB.initialize()
				.then(() => console.log("Data Source has been initialized!"));
			// successful
			break;
		} catch (err) {
			console.error(err);
			retries--;
			console.log(`Retries left: ${retries}`);
			console.log('Will retry in 10 seconds...');
			await new Promise(res => setTimeout(res, 10000));
		}
	}

	// Add guilds bot doesn't currently track to database
	await synchronizeGuilds(client.guilds);

	console.log(`Bot is ready.`);
});

client.login(process.env.TOKEN);

client.on('interactionCreate', interactionCreate);

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