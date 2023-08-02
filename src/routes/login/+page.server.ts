export const load = async ({ locals, url, fetch }) => {
  return {
    session: locals.session.data
  };
};
