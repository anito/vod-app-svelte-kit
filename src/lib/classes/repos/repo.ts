import * as api from '$lib/api';

export class Repo {
  endpoint: string;
  token: string;
  limit: number;
  lastpage: number;

  constructor() {
    this.token = '';
    this.limit = 10;
    this.endpoint = '';
    this.lastpage = 1;
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

  getAll = async (opts: {
    page?: number;
    limit?: number;
    token: string;
    match?: Record<string, string>;
  }): Promise<Response> => {
    let {
      page = 1,
      limit = this.limit,
      token = '',
      match = {}
    } = {
      ...opts
    };
    const searchParams = new URLSearchParams(match);
    page && searchParams.append('page', page.toString());
    limit && searchParams.append('limit', limit.toString());
    const url = `${this.endpoint}?${searchParams.toString()}`;

    return await api
      .get(url, { token: token || this.token })
      .then((res) => {
        if (res?.success) {
          this.lastpage = Number(page);
          return res;
        }
        return [];
      })
      .catch((reason) => {
        console.error('[REPO]', reason);
      });
  };

  setToken = (token: string) => {
    this.token = token;
    return this;
  };
}
