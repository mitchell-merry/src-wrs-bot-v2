import { Variable, Error, CategoryVariablesResponse } from 'src-ts';
import * as SRC from '.';

export async function getCategoryVariables(category_id: string): Promise<Variable[] | Error> {
	const res = await SRC.get<CategoryVariablesResponse>(`/categories/${category_id}/variables`);

	if('status' in res) return res;

	return res.data;
}