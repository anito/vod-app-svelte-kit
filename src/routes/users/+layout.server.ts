export async function load({ parent }: any) {
  const parentData = await parent();
  return { ...parentData };
}
