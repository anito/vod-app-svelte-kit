// @ts-nocheck
import * as api from '$lib/api';

export async function get() {
  return await api.get(`settings`, { fetch }).then((res) => {
    if (res.success) {
      return {
        status: 200,
        body: { data: res.data }
      };
    }
    return {
      status: 401,
      body: { ...res }
    };
  });
}
