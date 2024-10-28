/** @type {import('./$types').LayoutServerLoad} */

export async function load({ locals }: { locals: any }) {
    return {
        session: locals.session,
        alerts: locals.alerts || []
    };
}