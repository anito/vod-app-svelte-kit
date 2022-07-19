import * as api from '$lib/api';
import type { RequestEvent } from '@sveltejs/kit';
import { lt } from 'date-fns/locale';

type Response = {
	data: [],
	message: string,
	success: boolean
};

export class UsersRepo {
	request: Request;
	token: string;
	endpoint: string;

	constructor({ request, locals }: RequestEvent, endpoint: string) {
		this.request = request;
		this.token = locals.session.data.user?.jwt;
		this.endpoint = endpoint;
	}
	getAll = async ({
		limit,
		match = {}
	}: {
		limit: number,
		match?: Record<string, unknown>
	}): Promise<Response> => {
		const lt = (limit && '?limit=' + limit) || '';
		return await api.get(`${this.endpoint}${lt}`, { fetch, token: this.token }).then((res) => {
			return res.data;
		});
	};
}
