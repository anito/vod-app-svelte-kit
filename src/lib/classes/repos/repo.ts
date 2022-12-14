import * as api from '$lib/api';

export class Repo {
  endpoint: string;
  token: string;
  defaultLang = 'en-US';

  constructor() {
    this.token = '';
    this.endpoint = '';
  }

  get = async (
    slug: string,
    {
      lang = this.defaultLang,
      token
    }: {
      token: string;
      lang: string;
    }
  ) => {
    let endpoint = `${this.endpoint}/${slug}`;
    return await api.get(endpoint, { token: token || this.token }).then((res) => {
      return res.data;
    });
  };

  getAll = async ({
    page = '1',
    limit = '0',
    locale = this.defaultLang,
    token,
    match = {}
  }: {
    page: string;
    limit: string;
    locale: string;
    token: string;
    match?: Record<string, unknown>;
  }): Promise<Response> => {
    const searchParams = new URLSearchParams();
    page && searchParams.append('page', page);
    limit && searchParams.append('limit', limit);
    searchParams.append('lang', locale);

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
