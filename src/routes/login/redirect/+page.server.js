export function load({ url }) {
  const token = url.searchParams.get('token');
  if (token) {
    return {
      token
    };
  }
  return {};
}
