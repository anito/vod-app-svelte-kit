import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

export const actions = {
  add: async ({ request, fetch, locals }) => {
    return await request.formData().then(async (res) => {
      const formData = {} as any;
      res.forEach((value, key) => (formData[key] = value));
      return await fetch(`/users`, {
        method: 'POST',
        body: JSON.stringify({ ...formData, active: false })
      })
        .then(async (res) => await res.json())
        .catch((reason) => console.error('[ACTIONS]', reason));
    });
  },
  edit: async ({ request, params, fetch, locals }) => {
    const id = params.slug;
    return await request.formData().then(async (res) => {
      const formData = {} as any;
      res.forEach((value, key) => (formData[key] = value));
      return await fetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formData, locale: get(locale) })
      })
        .then(async (res) => await res.json())
        .catch((reason) => console.error('[ACTIONS]', reason));
    });
  },
  del: async ({ params, fetch, locals }) => {
    const id = params.slug;
    return await fetch(`/users/${id}`, {
      method: 'DELETE'
    })
      .then(async (res) => await res.json())
      .catch((reason) => console.error('[ACTIONS]', reason));
  }
};
