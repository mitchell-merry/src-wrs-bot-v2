import { CommandInteraction, EmojiResolvable, InteractionButtonOptions, Message, MessageActionRow, MessageButton, MessageButtonStyle, MessageSelectMenu } from "discord.js";
import UserError from "../UserError";

export interface DialogueOption {
	id: string;
	label: string;
	style?: InteractionButtonOptions['style'];
	emoji?: EmojiResolvable;
	disabled?: boolean;
}

export type SpawnAction = "REPLY" | "NEW_DELETE" | "NEW_STAY";

export default class DialogueMenu {
	private content: string;
	private options: DialogueOption[];
	private defaultStyle: InteractionButtonOptions['style'];

	constructor(content: string, options: DialogueOption[], defaultStyle: InteractionButtonOptions['style'] = "SECONDARY") {
		this.content = content;
		this.options = options;
		this.defaultStyle = defaultStyle;
	}

	public async spawnMenu(interaction: CommandInteraction, action: SpawnAction, timeout: number = 300000) {
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
		if (action === "REPLY") {
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
		let choice: string;
		if (r.isButton()) choice = r.customId
		else if (r.isSelectMenu()) choice = r.values[0];
		else throw new Error(`Unexpected interaction type: ${r.componentType}`);

		// deal with menu
		if (action === "NEW_DELETE") await menuMessage.delete();
		else await menuMessage.edit({
			content: `The selected option was "${this.options.find(o => o.id === choice)?.label ?? "UNKNOWN"}"`,
			components: []
		});

		return choice;
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