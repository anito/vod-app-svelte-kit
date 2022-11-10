import { invalid, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
}

/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  add: async ({ request, locals, fetch }) => {
    const { jwt } = locals.session.data.user;
    return await request.formData().then(async (res) => {
      /** @type {any} */
      const formData = {};
      res.forEach((value, key) => (formData[key] = value));
      return await fetch(`/users`, {
        method: 'POST',
        body: JSON.stringify({ ...formData, active: false, token: jwt })
      })
        .then(async (res) => await res.json())
        .catch((err) => console.error(err));
    });
  },
  edit: async ({ request, locals, params, fetch }) => {
    const id = params.slug;
    const { jwt } = locals.session.data.user;
    return await request.formData().then(async (res) => {
      /**@type {any} */
      const formData = {};
      res.forEach((value, key) => (formData[key] = value));
      return await fetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formData, token: jwt })
      })
        .then(async (res) => await res.json())
        .catch((err) => console.error(err));
    });
  },
  del: async ({ locals, params, fetch }) => {
    const id = params.slug;
    const { jwt } = locals.session.data.user;
    return await fetch(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ token: jwt })
    })
      .then(async (res) => await res.json())
      .catch((err) => console.error(err));
  }
};
