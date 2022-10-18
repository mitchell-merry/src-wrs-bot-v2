import { CommandInteraction } from "discord.js";
import * as SRC from "src-ts";
import UserError from "../UserError";
import DialogueMenu from "./DialogueMenu";

export default class LeaderboardMenu {
	private static types = {
		'per-game': "Full-game",
		'per-level': "Level"
	} as const;

	constructor() { }

	public async spawnMenu(interaction: CommandInteraction, gameId: string) {
		// get all the game info from speedrun.com
		const game = await SRC.getGame<'categories.variables,levels'>(gameId, { embed: 'categories.variables,levels' });

		// get the type of the leaderboard (full game / level)
		let type = await this.selectType(interaction, game);
		let message = `Selected "${LeaderboardMenu.types[type]}".\n`;

		// get the level of the leaderboard, if selected level
		let level: SRC.Level | undefined;
		if (type === "per-level") {
			level = await this.selectLevel(interaction, game.levels.data, message);
			message += `Selected the level "${level.name}".\n`;
		}

		// get the category for the leaderboard
		const category = await this.selectCategory(interaction, game.categories.data, type, message);
		message += `Selected the category "${category.name}"\n`;
		
		// update the message with the current selections (this is done with DialogueMenu in the previous two steps)
		await interaction.editReply({ content: message });
		
		// get the variables if any
		const variables = await this.selectVariables(interaction, category.variables.data, level);

		return { game, level, category, variables };
	}

	public async selectType(interaction: CommandInteraction, game: SRC.Game<'categories.variables,levels'>): Promise<SRC.CategoryType> {
		if (game.levels.data.length === 0 && game.categories.data.length === 0)
			throw new UserError(`The game ${game.names.international} has no leaderboards!`);

		if (game.levels.data.length !== 0 && game.categories.data.length !== 0) {
			const [type] = await new DialogueMenu<SRC.CategoryType>(`Is the leaderboard a full-game or level category?`, LeaderboardMenu.types, "PRIMARY")
				.spawnMenu(interaction, "EDIT_REPLY");
			return type;
		}
		else if (game.levels.data.length === 0) return "per-game";
		else return "per-level";
	}

	public async selectLevel(interaction: CommandInteraction, levels: SRC.Level[], message: string,) {
		if (levels.length === 1) return levels[0];
		
		let q = (message !== '' ? `${message}\n` : '') + 'Choose a level:';
		const levelOptions = levels.map(level => ({ id: level.id, label: level.name }));
		const [ levelId ] = await new DialogueMenu(q, levelOptions, "PRIMARY").spawnMenu(interaction, "EDIT_REPLY");
		
		return levels.find(l => l.id === levelId)!;
	}

	public async selectCategory<E extends string, T extends SRC.CategoryType>(interaction: CommandInteraction, categories: SRC.Category<E, T>[], type: T, message: string): Promise<SRC.Category<E>> {
		if (categories.length === 1) return categories[0];

		let q = (message !== '' ? `${message}\n` : '') + 'Choose a category:';
		const catOptions = categories.filter(c => c.type === type).map(c => ({ id: c.id, label: c.name }));
		const [ categoryId ] = await new DialogueMenu(q, catOptions, "PRIMARY").spawnMenu(interaction, "EDIT_REPLY");

		return categories.find(c => c.id === categoryId)!;
	}

	public async selectVariables(interaction: CommandInteraction, variables: SRC.Variable[], level?: SRC.Level): Promise<[SRC.Variable, string][]> {
		return Promise.all(variables.filter(SRC.variableIsSubcategory)
			.filter(v => level === undefined 
				|| v.scope.type === 'all-levels'
				|| (v.scope.type === 'single-level' && v.scope.level === level.id)
			).map(async subcat => {
				const options = Object.entries(subcat.values.values)
					.map(([k, v]) => ({ id: k, label: v.label }));
	
				const [ value ] = await new DialogueMenu(`Choose a value for the variable ${subcat.name}:`, options, "PRIMARY").spawnMenu(interaction, "NEW_REPLY");
				return [ subcat, value ];
			})
		);
	}
}