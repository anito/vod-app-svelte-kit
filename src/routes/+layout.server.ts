export async function load({ locals }: { locals: { session: any } }) {
  return { session: locals.session.data, rnd: rnd() };
}

function rnd(n = 3) {
  const digits = (x = 1) => Math.floor(Math.random() * Math.pow(10, x));
  let ret = '';
  for (let i = 0; i < n; i++) {
    ret = ret.concat(`${digits(3)}-`);
  }
  return ret.slice(0, -1);
}
