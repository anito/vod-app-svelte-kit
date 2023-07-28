export const actions = {
  login: async ({ request, locals, fetch, url }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    const body = JSON.stringify({ email, password });
    const res = await fetch('/auth/login', { method: 'POST', body }).then(async (res) =>
      res.json()
    );
    return res;
  },
  logout: async ({ fetch }) => {
    const res = await fetch('/auth/logout', { method: 'POST' }).then(async (res) => res.json());
    return res;
  }
};
