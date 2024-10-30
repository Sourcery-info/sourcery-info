/** @type {import('./$types').LayoutServerLoad} */

export async function load({ locals }: { locals: any }) {
    return {
        session: locals.session,
        user: locals.user,
        alerts: locals.alerts || []
    };
}