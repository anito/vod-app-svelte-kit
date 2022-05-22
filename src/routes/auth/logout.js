// @ts-nocheck

import * as api from '$lib/api.js';

export async function del({ locals, request }) {

  return await api.post(`users/logout`).then((response) => {
    
    locals.session.destroy();

    return {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    }
  });
}
