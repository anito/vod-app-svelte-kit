/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  more: async ({ request, fetch, locals }) => {
    const data = await request.formData();
    return await fetch(`/repos/users?page=${data.get('page')}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
};
