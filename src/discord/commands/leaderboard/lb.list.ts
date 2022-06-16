import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessagePayload, WebhookEditMessageOptions } from "discord.js";
import { DB } from "../../../db";
import { TrackedLeaderboard } from "../../../db/models";
import UserError from "../../UserError";
import { array_chunks } from "../../util";

const PAGE_LENGTH = 2;

export async function list(interaction: CommandInteraction) {
	const tlbRepo = DB.getRepository(TrackedLeaderboard);
	await interaction.deferReply();
	const message = await interaction.fetchReply() as Message;

	// get leaderboards tracked by guild
	const boards = await tlbRepo.find({ where: { guild_id: interaction.guildId! }, relations: { leaderboard: true } });
	if(!boards || boards.length === 0) throw new UserError("This guild tracks no leaderboards.");
	// group boards in chunks
	const pages = array_chunks(boards, PAGE_LENGTH);
	let page = 0;
	let r: MessageComponentInteraction | undefined = undefined;

	while(true) {
		const options: WebhookEditMessageOptions = {
			content: pageOutput(pages, page),
			components: pageComponents(page, pages.length)
		};

		await (r 
			? r.update(options)
			: interaction.editReply(options)
		);
		
		// listen for button
		r = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 300000 })
			.catch(r => {throw new UserError("This list has expired. Spawn a new one with /leaderboard list.")});

		switch(r.customId) {
			case(`left_all`): page = 0; break;
			case(`left_once`): page--; break;
			case(`right_once`): page++; break;
			case(`right_all`): page = pages.length-1; break;
		}
	}
}

function pageOutput(pages: TrackedLeaderboard[][], page: number): string {
	return `\`\`\`${
		pages[page].map((tlb, i) => {
			return `[${page*PAGE_LENGTH+i+1}] ${tlb.leaderboard.lb_name}`;
		}).join('\n')
	}\`\`\``;
}

function pageComponents(page: number, pageCount: number): MessageActionRow[] {
	return [new MessageActionRow().addComponents([
		new MessageButton().setLabel('|<').setCustomId(`left_all`).setDisabled(page === 0).setStyle('PRIMARY'),
		new MessageButton().setLabel('<').setCustomId(`left_once`).setDisabled(page === 0).setStyle('PRIMARY'),
		new MessageButton().setLabel(`${page+1} / ${pageCount}`).setCustomId('page').setDisabled(true).setStyle('SECONDARY'),
		new MessageButton().setLabel('>').setCustomId(`right_once`).setDisabled(page === pageCount-1).setStyle('PRIMARY'),
		new MessageButton().setLabel('>|').setCustomId(`right_all`).setDisabled(page === pageCount-1).setStyle('PRIMARY'),
	])];
}