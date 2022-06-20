import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';

import { Error } from 'src-ts';

const fetchSRC = new Bottleneck({
	reservoir: 100,
	reservoirRefreshAmount: 100,
	reservoirRefreshInterval: 60 * 1000,
   
	maxConcurrent: 1,
	minTime: 333
}).wrap(fetch);

const BASE_URL = "https://www.speedrun.com/api/v1";

export * from './user';
export * from './game';
export * from './category';
export * from './leaderboard';

export function buildLeaderboardName(gameName: string, categoryName: string, variables: string[], levelName?: string) {
	let name = `${gameName}`;
	if(levelName) name += `: ${levelName}`;
	name += ` - ${categoryName}`;
	
	if(variables.length !== 0)
	{
		name += ` (${variables.join(', ')})`;
	}

	return name;
}

export async function get<ResponseType>(url: string, options: Record<string, any> = {}): Promise<ResponseType | Error> {
	url = `${BASE_URL}${url}`;

	// Prevent caching by making the call unique
	options.dummy = Date.now();
	
	if(Object.entries(options).length != 0) {
		url += `?${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('&')}`;
	}

	console.log(`[SRC] Fetching "${url}"`);
	const res = await fetchSRC(url).then(res => res.json()) as ResponseType | Error;
	
	return res;
}

export function isError(obj: any): obj is Error {
	return !!obj && typeof obj === "object"
		&& 'status' in obj;
}