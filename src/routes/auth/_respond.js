// @ts-nocheck
export function respond(body) {
	if (body.errors) {
		return { status: 401, body };
	}

	const json = JSON.stringify(body);
	const value = Buffer.from(json).toString('base64');

	console.log(value)

	return {
		headers: {
			'set-cookie': `jwt=${value}; Path=/; HttpOnly`
		},
		body
	};
}
