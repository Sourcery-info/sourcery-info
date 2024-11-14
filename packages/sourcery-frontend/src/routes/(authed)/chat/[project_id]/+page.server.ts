/** @type {import('./$types').PageServerLoad} */
import { randomUUID } from 'node:crypto';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const conversation = randomUUID();
    redirect(307, `/chat/${params.project}/${conversation}`);
};

export const actions = {
}
