export const load = async ({ fetch }) => {
  return await fetch('auth/logout').then((res) => {
    return res.json();
  });
};
