// @ts-nocheck
export async function get({ locals, request }) {
	const data = await locals.session.data();

	return {
		body: { ...data }
	};
}
