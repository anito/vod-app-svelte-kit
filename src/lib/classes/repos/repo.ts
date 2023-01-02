import * as api from '$lib/api';

export class Repo {
  endpoint: string;
  token: string;

  constructor() {
    this.token = '';
    this.endpoint = '';
  }

  get = async (
    slug: string,
    {
      token
    }: {
      token: string;
    }
  ) => {
    const url = `${this.endpoint}/${slug}`;
    return await api.get(url, { token: token || this.token }).then((res) => {
      return res.data;
    });
  };

  getAll = async ({
    page = '1',
    limit = '0',
    token,
    match = {}
  }: {
    page: string;
    limit: string;
    token: string;
    match?: Record<string, unknown>;
  }): Promise<Response> => {
    const searchParams = new URLSearchParams();
    page && searchParams.append('page', page);
    limit && searchParams.append('limit', limit);
    const url = `${this.endpoint}?${searchParams.toString()}`;
    return await api
      .get(url, { token: token || this.token })
      .then((res) => {
        if (res?.success) {
          return res;
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
