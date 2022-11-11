import * as api from '$lib/api';
import { get } from 'svelte/store';
import { locale as i18n } from 'svelte-i18n';
import { settings } from '$lib/stores';

/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  login: async ({ request, locals, fetch, url }) => {
    const data = await request.formData();
    const type = url.searchParams.get('type') || 'login';
    const locale = locals.session.data.locale || get(i18n);

    const res = await api.post(`${type}`, {
      data: { email: data.get('email'), password: data.get('password') }
    });

    /** @type {import('$lib/types').User} */
    const { id, name, email, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

    await locals.session.destroy();
    if (res.success) {
      const $settings = get(settings);
      const lifetime = url.searchParams.get('lifetime') || $settings.Session.lifetime;
      const _expires = new Date(Date.now() + parseInt(lifetime)).toISOString();

      await locals.session.set({
        _expires,
        user: { id, name, jwt, avatar, email },
        role,
        groups,
        locale
      });
    } else {
      await locals.session.set({ locale });
    }

    return res;
  },
  logout: async ({ fetch }) => {
    const res = await fetch('/auth/logout', { method: 'POST' }).then(async (res) => res.json());
    return { ...res };
  }
};
