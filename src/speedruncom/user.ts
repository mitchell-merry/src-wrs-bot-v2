import { UserResponse, Error, User } from 'src-ts';
import * as SRC from '.';

/** Get the User data from a username or id */
export async function getUser(username: string): Promise<User | Error> {
	const res = await SRC.get<UserResponse>(`/users/${username}`);

	if('status' in res) return res;

	return res.data;
}