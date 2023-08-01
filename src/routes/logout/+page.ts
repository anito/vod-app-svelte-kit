export const load = async ({ fetch, url, data }) => {
  return await fetch('auth/logout').then((res) => {
    return res.json();
  });
};
