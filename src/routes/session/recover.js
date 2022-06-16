// @ts-nocheck
export async function get({ locals }) {
	const data = locals.session.data;

	return {
		body: { ...data }
	};
}
