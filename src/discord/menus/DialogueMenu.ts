import { CommandInteraction, EmojiResolvable, InteractionButtonOptions, Message, MessageActionRow, MessageButton, MessageButtonStyle, MessageSelectMenu } from "discord.js";
import UserError from "../UserError";

export interface DialogueOption<T extends string = string> {
	id: T;
	label: string;
	style?: InteractionButtonOptions['style'];
	emoji?: EmojiResolvable;
	disabled?: boolean;
}

export type SpawnAction = "REPLY" | "REPLY_NO_EDIT" | "NEW_DELETE" | "NEW_STAY";

export default class DialogueMenu<T extends string = string> {
	private content: string;
	private options: DialogueOption[];
	private defaultStyle: InteractionButtonOptions['style'];

	constructor(content: string, options: DialogueOption<T>[] | Record<string, T>, defaultStyle: InteractionButtonOptions['style'] = "SECONDARY") {
		this.content = content;
		
		if (Array.isArray(options)) this.options = options;
		else this.options = Object.entries(options).map(([k, v]) => ({ id: k, label: v }));

		this.defaultStyle = defaultStyle;
	}

	public async spawnMenu(interaction: CommandInteraction, action: SpawnAction, timeout: number = 300000): Promise<[T, string]> {
		// get the components of the menu (buttons / select menu for > 5 items)
		const components = this.getComponents();

		// build the message to send
		const messageOptions = {
			content: this.content,
			components
		};

		let menuMessage: Message;

		// depending on the action, either reply / edit the reply to the interaction,
		// or send a new message in the same channel
		if (action === "REPLY" || action === "REPLY_NO_EDIT") {
			menuMessage = await ((interaction.replied || interaction.deferred)
				? interaction.editReply(messageOptions) 
				: interaction.reply(messageOptions)) as Message;
		} else {
			menuMessage = await interaction.channel!.send(messageOptions) as Message;
		}

		// wait for the response to the menu
		const r = await menuMessage.awaitMessageComponent({
			time: timeout,
			filter: i => i.user.id === interaction.user.id
		}).catch(_ => {
			throw new UserError("This menu has expired.");
		});

		// get the choice
		let choice: T;
		if (r.isButton()) choice = r.customId as T;
		else if (r.isSelectMenu()) choice = r.values[0] as T;
		else throw new Error(`Unexpected interaction type: ${r.componentType}`);

		let choiceLabel = this.options.find(o => o.id === choice)!.label;
		
		// deal with menu
		if (action === "NEW_DELETE") await menuMessage.delete();
		else if (action === "REPLY_NO_EDIT") await menuMessage.edit({ components: [] });
		else await menuMessage.edit({
			content: `The selected option was "${choiceLabel}"`,
			components: []
		});

		return [ choice, choiceLabel ];
	}

	private getComponents() {
		const row = this.options.length <= 5 
			? this.options.map(o => this.buildButton(o))
			: [ this.buildSelect(this.options) ];
		return [ new MessageActionRow().addComponents(row) ];
	}

	private buildButton(option: DialogueOption) {
		return new MessageButton()
			.setCustomId(option.id)
			.setLabel(option.label)
			.setStyle(option.style ?? this.defaultStyle)
			.setEmoji(option.emoji ?? '')
			.setDisabled(option.disabled ?? false);
	}
	
	private buildSelect(options: DialogueOption[]) {
		return new MessageSelectMenu()
			.setCustomId('select_menu')
			.setPlaceholder('Nothing selected.')
			.setMinValues(1).setMaxValues(1)
			.addOptions(options.map(option => ({
				label: option.label,
				value: option.id,
				emoji: option.emoji,
			})));
	}
}