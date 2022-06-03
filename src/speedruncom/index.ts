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

export async function get<ResponseType>(url: string, options: Record<string, any> = {}): Promise<ResponseType | Error> {
	url = `${BASE_URL}${url}`;
	
	if(Object.entries(options).length != 0) {
		url += `?${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('&')}`;
	}

	const res = await fetchSRC(url).then(res => res.json()) as ResponseType | Error;
	
	return res;
}

export function isError(obj: any): obj is Error {
	return !!obj && typeof obj === "object"
		&& 'status' in obj;
}