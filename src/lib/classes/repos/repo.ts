import * as api from '$lib/api';

export class Repo {
  endpoint: string;
  token: string;

  constructor() {
    this.token = '';
    this.endpoint = '';
  }

  get = async (slug: string) => {
    let endpoint = `${this.endpoint}/${slug}`;
    return await api.get(endpoint, { fetch, token: this.token }).then((res) => {
      return res.data;
    });
  };

  getAll = async ({
    limit,
    token,
    match = {}
  }: {
    limit: number,
    token: string,
    match?: Record<string, unknown>
  }): Promise<Response> => {
    const lt = (limit && '?limit=' + limit) || '';
    let endpoint = this.endpoint + lt;
    return await api
      .get(endpoint, { fetch, token: token || this.token })
      .then((res) => {
        if (res.success) {
          return res.data;
        }
        return [];
      })
      .catch((reason) => {
        console.error(reason);
      });
  };

  setToken = (token: string) => {
    this.token = token;
    return this;
  };
}
