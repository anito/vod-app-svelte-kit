// @ts-nocheck
import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';

export async function GET() {
  return json(
    await api.get(`settings`, { fetch }).then((res) => {
      if (res.success) {
        return { data: res.data };
      }
      throw error(401);
    })
  );
}
