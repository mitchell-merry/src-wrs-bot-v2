import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, InteractionReplyOptions, Message, MessageComponentInteraction, WebhookEditMessageOptions } from "discord.js";
import UserError from "../UserError";

const MESSAGE_LIMIT = 2000;

export default class PaginatedList {
	private items: string[];
	private pages: string[][];
	private pageSize: number;
	private currentPage: number;
	private expireMessage: string;

	constructor(items: string[], pageSize: number = 25, expireMessage = "This list has expired.")
	{
		this.items = items.map((item, i) => `[${i+1}] ${item}\n`);
		this.pages = [[]];
		this.pageSize = pageSize;

		this.items.forEach(item => {
			const lastPage = this.pages.at(-1)!;
			const pageLength = lastPage.reduce((prev, curr) => prev + curr.length, 0);
			
			if (lastPage.length >= this.pageSize || pageLength + item.length > MESSAGE_LIMIT) this.pages.push([item]);
			else lastPage.push(item);
		});

		this.currentPage = 0;
		this.expireMessage = expireMessage;
	}

	public async spawnMenu(interaction: ChatInputCommandInteraction)
	{
		const message = await interaction.fetchReply() as Message;
		let r: MessageComponentInteraction | undefined = undefined;

		while(true) {
			const data = {
				content: this.pages[this.currentPage].join(''),
				components: this.getPageComponents(this.currentPage),
				allowedMentions: { users: [], roles: [] }
			};

			await (r 
				? r.update(data)
				: interaction.editReply(data)
			);
			
			// listen for button
			r = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 300000 })
				.catch(_ => {throw new UserError(this.expireMessage)});

			switch(r.customId) {
				case(`left_all`): this.currentPage = 0; break;
				case(`left_once`): this.currentPage--; break;
				case(`right_once`): this.currentPage++; break;
				case(`right_all`): this.currentPage = this.pages.length-1; break;
			}
		}
	}

	private getPageComponents(page: number) {
		const isFirstPage = page === 0;
		const isLastPage = page === this.pages.length - 1;

		return [new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder().setLabel('|<').setCustomId(`left_all`).setDisabled(isFirstPage).setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setLabel('<').setCustomId(`left_once`).setDisabled(isFirstPage).setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setLabel(`${page+1} / ${this.pages.length}`).setCustomId('page').setDisabled(true).setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setLabel('>').setCustomId(`right_once`).setDisabled(isLastPage).setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setLabel('>|').setCustomId(`right_all`).setDisabled(isLastPage).setStyle(ButtonStyle.Primary),
		])];
	}
}