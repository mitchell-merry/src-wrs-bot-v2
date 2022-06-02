import { UserResponse, Error } from 'src-ts';
import * as SRC from '.';

export async function getUserId(username: string): Promise<string | Error> {
	const res = await SRC.get<UserResponse>(`/users/${username}`);

	if('status' in res) return res;

	return res.data.id;
}