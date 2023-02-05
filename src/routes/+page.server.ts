import * as api from '$lib/api';
import type { Actions } from '@sveltejs/kit';

export const actions = {
  send: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const token = formData.get('token');
    const content = formData.get('message');
    const template = formData.get('template');
    return await api
      .post(`sents/add`, { data: { user: { name, email }, subject, content, template }, token })
      .then(async (res) => res)
      .catch((reason) => console.error('[ACTIONS]', reason));
  }
} as Actions;
