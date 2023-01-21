import { redirect, type Actions, type ServerLoadEvent } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

export async function load({ locals }: ServerLoadEvent) {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
}

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
        .catch((err) => console.error(err));
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
        .catch((err) => console.error(err));
    });
  },
  del: async ({ params, fetch, locals }) => {
    const id = params.slug;
    return await fetch(`/users/${id}`, {
      method: 'DELETE'
    })
      .then(async (res) => await res.json())
      .catch((err) => console.error(err));
  }
} as Actions;