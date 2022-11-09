import * as api from '$lib/api';
import { invalid, json } from '@sveltejs/kit';

/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  default: async ({ request, locals, fetch, url }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
    const token = data.get('token');
    const type = url.searchParams.get('type') || 'login';

    const res = await api.post(`${type}`, { data: { email, password }, token });
    return json(res);
  }
};
