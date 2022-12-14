/** @type {import("@sveltejs/kit").Actions} */
export const actions = {
  more_videos: async ({ request, fetch }) => {
    const data = await request.formData();
    return await fetch(`/repos/videos?page=${data.get('page')}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  },
  more_images: async ({ request, fetch }) => {
    const data = await request.formData();
    return await fetch(`/repos/images?page=${data.get('page')}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
};
