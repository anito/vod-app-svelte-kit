// @ts-nocheck
export async function get({ locals, params }) {
  const data = locals.session.data;
  const slug = params.slug;
  let status, body;
  if (data[slug]) {
    status = 200;
    body = { data: data[slug] };
  } else {
    status = 302;
    body = { data: null };
  }

  return {
    status,
    body
  };
}
