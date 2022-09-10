export async function load({ url }: any) {
  const token = url.searchParams.get('token');
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res: any) => {
      const response = await res.json();
      return { ...response, hasToken: true };
    });
  }
  return {};
}
