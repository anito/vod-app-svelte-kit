// @ts-nocheck
export async function get({ locals }) {
  return {
    status: 200,
    body: {
      data: locals.session.data
    }
  };
}
