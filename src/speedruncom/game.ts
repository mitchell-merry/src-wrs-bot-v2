import { Category, Error, GameCategoriesResponse } from 'src-ts';
import * as SRC from '.';

export async function getGameCategories(game_id: string): Promise<Category[] | Error> {
	const res = await SRC.get<GameCategoriesResponse>(`/games/${game_id}/categories`);

	if('status' in res) return res;

	return res.data;
}