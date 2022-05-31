/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents } from 'discord.js'

import { DB } from './db'
import { GuildEntity } from './db/models'
const client = new Client({ intents: [ Intents.FLAGS.GUILDS ] });


client.on('ready', async () => {
	if(!client.user) throw new Error(`Null client.user? ${client}`);
	console.log(`Logged in as ${client.user.tag}!`);

	await DB.initialize()
		.then(() => console.log("Data Source has been initialized!"))
		.catch(err => console.error("Error during Data Source initialization", err));

	
});

client.login(process.env.TOKEN);