// @ts-nocheck

import * as api from '$lib/api.js';
import { error, json } from '@sveltejs/kit';

export async function DELETE({ locals, data }) {
  const locale = locals.session.data.locale;
  await locals.session.destroy();
  // re-save locale to session
  if (locale) {
    await locals.session.set({ locale });
  }

  return await api.post(`users/logout?locale=${locale}`, { fetch }).then((res) => {
    return json({
      ...res
    });
  });
}
