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
  }
};
