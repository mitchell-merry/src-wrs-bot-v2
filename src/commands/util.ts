import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageComponentInteraction, MessageSelectMenu } from "discord.js";

interface MenuOption
{
	value: string;
	label: string;
	style?: MessageButtonStyleResolvable;
}

export async function sendMenu(interaction: CommandInteraction, message: string, components: MessageActionRow[]) {
	await interaction.reply({ content: message, components });
	
	const m = await interaction.fetchReply();
	if(!(m instanceof Message)) throw new Error("Message sent is an APIMessage. Why.");

	return m.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 300000 });
}

export function getResponse(int: MessageComponentInteraction) {
	if(!int || !(int.message instanceof Message))
	{
		int.reply("Error, no choice");
		throw new Error("No choice");
	}

	if(int.isButton()) return int.customId;
	if(int.isSelectMenu()) return int.values[0];

	throw new Error("Unexpected interaction type. " + int.componentType);
}

export function buildMenu(menuOptions: MenuOption[], id: string): MessageActionRow {
	const row = menuOptions.length <= 5 
		? menuOptions.map(buildButton)
		: [ buildSelect(menuOptions, id) ];
	return new MessageActionRow().addComponents(row);
}

export function buildButton(opt: MenuOption) {
	return new MessageButton().setCustomId(opt.value).setLabel(opt.label)
		.setStyle(opt.style || "PRIMARY");
}

export function buildSelect(opts: MenuOption[], id: string) {
	return new MessageSelectMenu().setCustomId(id).setPlaceholder('Nothing selected.')
		.setMinValues(1).setMaxValues(1).addOptions(opts);
}

export function array_chunks<T>(array: T[], chunk_size: number) {
	return Array(Math.ceil(array.length / chunk_size))
		.fill(0).map((_, index) => index * chunk_size)
		.map(begin => array.slice(begin, begin + chunk_size));
}