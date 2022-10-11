import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageComponentInteraction, WebhookEditMessageOptions } from "discord.js";
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

	public async spawnMenu(interaction: CommandInteraction)
	{
		const message = await interaction.fetchReply() as Message;
		let r: MessageComponentInteraction | undefined = undefined;

		while(true) {
			const options: WebhookEditMessageOptions = {
				content: this.pages[this.currentPage].join(''),
				components: this.getPageComponents(this.currentPage)
			};

			await (r 
				? r.update(options)
				: interaction.editReply(options)
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

		return [new MessageActionRow().addComponents([
			new MessageButton().setLabel('|<').setCustomId(`left_all`).setDisabled(isFirstPage).setStyle('PRIMARY'),
			new MessageButton().setLabel('<').setCustomId(`left_once`).setDisabled(isFirstPage).setStyle('PRIMARY'),
			new MessageButton().setLabel(`${page+1} / ${this.pages.length}`).setCustomId('page').setDisabled(true).setStyle('SECONDARY'),
			new MessageButton().setLabel('>').setCustomId(`right_once`).setDisabled(isLastPage).setStyle('PRIMARY'),
			new MessageButton().setLabel('>|').setCustomId(`right_all`).setDisabled(isLastPage).setStyle('PRIMARY'),
		])];
	}
}