import { UserResponse } from 'src-ts';
import * as SRC from '.';

export async function getUserId(username: string): Promise<string> {
	const res = await SRC.get<UserResponse>(`/users/${username}`).then(res => res.data);
	return res.id;
}