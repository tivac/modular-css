import { redirect } from '@sveltejs/kit';

/* Just a redirect to /overview */
export async function load() {
throw redirect(301, "/overview/");
}
