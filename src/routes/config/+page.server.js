/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  reload: async ({ request, fetch }) => {
    return await request.formData().then(async (res) => {
      return await fetch(`/config`, {
        method: 'GET'
      })
        .then(async (res) => await res.json())
        .catch((err) => console.error(err));
    });
  },
  mode: async ({ request, locals }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('/mode');
    await locals.session.set({ ...locals.session.data, mode });
    return { mode };
  }
};
