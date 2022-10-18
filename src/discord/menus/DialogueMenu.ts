import { CommandInteraction, EmojiResolvable, InteractionButtonOptions, Message, MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import UserError from "../UserError";

export interface DialogueOption<T extends string = string> {
	id: T;
	label: string;
	style?: InteractionButtonOptions['style'];
	emoji?: EmojiResolvable;
	disabled?: boolean;
}

export type SpawnAction = "NEW_REPLY" | "EDIT_REPLY" | "NEW_MESSAGE";

export default class DialogueMenu<T extends string = string> {
	private content: string;
	private options: DialogueOption[];
	private defaultStyle: InteractionButtonOptions['style'];

	constructor(content: string, options: readonly DialogueOption<T>[] | Record<T, string>, defaultStyle: InteractionButtonOptions['style'] = "SECONDARY") {
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
		if (action === "EDIT_REPLY") {
			menuMessage = await ((interaction.replied || interaction.deferred)
				? interaction.editReply(messageOptions) 
				: interaction.reply(messageOptions)) as Message;
		} else if (action === "NEW_REPLY") {
			menuMessage = await interaction.followUp(messageOptions) as Message;
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
		if (action === "NEW_MESSAGE" || action === "NEW_REPLY") await menuMessage.delete();
		else await r.update({ components: [] });

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