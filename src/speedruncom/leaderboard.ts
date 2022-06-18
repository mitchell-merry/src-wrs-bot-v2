import { LeaderboardResponse, Error, LeaderboardParams, Leaderboard, LeaderboardLevelResponse, LeaderboardLevelParams } from 'src-ts';
import * as SRC from '.';

/** Get the User data from a username or id */
export async function getLeaderboard(game: string, category: string, options?: LeaderboardParams): Promise<Leaderboard | Error> {
	const res = await SRC.get<LeaderboardResponse>(`/leaderboards/${game}/category/${category}`, options);

	if('status' in res) return res;

	return res.data;
}

export async function getLevelLeaderboard(game: string, level: string, category: string, options?: LeaderboardLevelParams): Promise<Leaderboard | Error> {
	const res = await SRC.get<LeaderboardLevelResponse>(`/leaderboards/${game}/level/${level}/${category}`, options);

	if('status' in res) return res;

	return res.data;
}