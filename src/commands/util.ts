import { MessageActionRow, MessageButton, MessageButtonStyleResolvable } from "discord.js";

interface MenuOption
{
	id: string;
	label: string;
	style?: MessageButtonStyleResolvable;
}

export function buildMenu(menuOptions: MenuOption[]): MessageActionRow[] {
	return array_chunks(menuOptions, 5).map(row =>
		new MessageActionRow().addComponents(row.map(buildButton))
	);
}

export function buildButton(opt: MenuOption) {
	return new MessageButton().setCustomId(opt.id).setLabel(opt.label)
		.setStyle(opt.style || "PRIMARY");
}

export function array_chunks<T>(array: T[], chunk_size: number) {
	return Array(Math.ceil(array.length / chunk_size))
		.fill(0).map((_, index) => index * chunk_size)
		.map(begin => array.slice(begin, begin + chunk_size));
}