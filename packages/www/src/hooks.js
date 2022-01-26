/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		ssr : !event.url.pathname.startsWith("/repl"),
	});

	return response;
}
