// @ts-nocheck
import * as api from '$lib/api';

export async function serverConfig() {
  return await api.get(`settings`).then((res) => {
    return res;
  });
}
