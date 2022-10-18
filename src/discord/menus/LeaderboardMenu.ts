import { CommandInteraction } from "discord.js";
import * as SRC from "src-ts";
import UserError from "../UserError";
import DialogueMenu from "./DialogueMenu";

export default class LeaderboardMenu {
	private static types = [{
		id: 'per-game',
		label: "Full-game"
	}, { 
		id: 'per-level',
		label: "Level"
	}] as const;

	constructor() {

	}

	public async spawnMenu(interaction: CommandInteraction, gameId: string) {
		const game = await SRC.getGame<'categories.variables,levels'>(gameId, { embed: 'categories.variables,levels' });

		let type: SRC.CategoryType;
		let label: string | undefined;

		if (game.levels.data.length === 0 && game.categories.data.length === 0)
			throw new UserError(`The game ${game.names.international} has no leaderboards!`);

		if (game.levels.data.length !== 0 && game.categories.data.length !== 0) {
			[ type, label ] = await new DialogueMenu<SRC.CategoryType>(`Is the leaderboard a full-game or level category?`, LeaderboardMenu.types, "PRIMARY")
				.spawnMenu(interaction, "REPLY_NO_EDIT");
		}
		else if (game.levels.data.length === 0) type = "per-game";
		else type = "per-level";

		
	}
}