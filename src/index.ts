/** Entry file */
import 'dotenv/config'
import 'reflect-metadata'

import { Client, Intents, Interaction } from 'discord.js'

import { DB, isUserMod, synchronizeGuilds } from './db'
import { commands, CommandFile } from './discord';
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
	if (!interaction.isCommand()) return;

	const command = commandDict[interaction.commandName];

	try {

		if(!command) throw new Error(`Command ${interaction.commandName} unknown`);

		// Get the perm level of the command or subcommand.
		let permLevel;
		if(typeof command.perms === 'string') permLevel = command.perms;
		else permLevel = command.perms[interaction.options.getSubcommand()];
		
		if(!permLevel) throw new Error(`Permission level missing for ${interaction.options.getSubcommand()}.`);
		if(typeof interaction.member?.permissions === 'string') throw new Error(`error with ${interaction.member?.permissions}`)

		const userIsAdmin = interaction.user.id === process.env.admin || interaction.member!.permissions.has('ADMINISTRATOR');
		const userIsMod = userIsAdmin || (await isUserMod(interaction.guildId, interaction.member));

		// Check user has correct permission.
		if(permLevel === 'admin' && !userIsAdmin) throw new UserError(`Only admins are allowed to use this command! Loser. Scram!!`);
		else if(permLevel === 'mods' && !userIsMod) throw new UserError(`Only mods and above are allowed to use this! Shame on you. Bad.`);

		await command.execute(interaction);
	} catch (error) {
		const msg = {
			content: "Unknown error occurred.",
			components: []
		};

		if(error instanceof UserError) {
			msg.content = error.message;
		} else {
			console.error(error);
		}

		await (interaction.replied || interaction.deferred 
			? interaction.editReply(msg) 
			: interaction.reply(msg));
	}    
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isAutocomplete()) return;

	// TODO: Make more modular
	if(interaction.commandName === 'leaderboard'
		&& (interaction.options.getSubcommand() === 'remove' || interaction.options.getSubcommand() === 'setrole')
	) {
		const tlbRepo = DB.getRepository(TrackedLeaderboardEntity);
		const val = interaction.options.getFocused(true).value as string;

		const boards = await tlbRepo.find({ where: { guild_id: interaction.guildId! }, relations: { leaderboard: true } });

		// TODO sort alphabetically
		const response = boards
			.filter(tlb => tlb.leaderboard.lb_name.toLowerCase().includes(val.toLowerCase()))
			.map(tlb => ({
				name: `${tlb.leaderboard.lb_name}`,
				value: tlb.leaderboard.lb_id
			}))
			.slice(0, 25);

		interaction.respond(response);
	}
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