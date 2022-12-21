import { redirect } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

/**
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ locals }) {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
}

/**
 * @type {import("@sveltejs/kit").Actions}
 */
export const actions = {
  add: async ({ request, fetch, locals }) => {
    return await request.formData().then(async (res) => {
      /** @type {any} */
      const formData = {};
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
      /**@type {any} */
      const formData = {};
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
};
