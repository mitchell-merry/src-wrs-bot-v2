import { UserResponse } from 'src-ts';
import * as SRC from '.';

export async function getUserId(username: string): Promise<string | null> {
	const res = await SRC.get<UserResponse>(`/users/${username}`);

	if('status' in res) {
		if(res.message.endsWith(' could not be found.')) return null;

		console.error(res);
		throw new Error(res.message);
	}

	return res.data.id;
}