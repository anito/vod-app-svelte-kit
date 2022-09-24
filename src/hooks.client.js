/** @type {import('@sveltejs/kit').HandleClientError} */
export function _handleError({ error, event }) {
  console.log(error, event);

  return {
    message: 'Whoops!',
    code: error.code ?? 'UNKNOWN'
  };
}
