import { Category, Error, Game, GameCategoriesResponse, GameParams, GameResponse } from 'src-ts';
import * as SRC from '.';

export async function getGame(game_id: string, options: GameParams): Promise<Game | Error> {
	const res = await SRC.get<GameResponse>(`/games/${game_id}`, options);

	if('status' in res) return res;

	return res.data;
}

export async function getGameCategories(game_id: string): Promise<Category[] | Error> {
	const res = await SRC.get<GameCategoriesResponse>(`/games/${game_id}/categories`);

	if('status' in res) return res;

	return res.data;
}