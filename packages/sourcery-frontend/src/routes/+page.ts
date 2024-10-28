import { redirect } from "@sveltejs/kit";

export async function load() {
    // Redirect to /projects
    redirect(302, '/projects');
}