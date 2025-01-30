import { json } from '@sveltejs/kit';
import { removeProject } from '$lib/classes/projects';

export async function DELETE({ params, locals }) {
	if (!locals?.session?.user_id) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		await removeProject(params.project_id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting project:', error);
		return new Response('Failed to delete project', { status: 500 });
	}
} 
