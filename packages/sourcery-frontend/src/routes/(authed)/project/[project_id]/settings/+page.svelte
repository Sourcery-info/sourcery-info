<script lang="ts">
	import ProjectSettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import Alert from '$lib/ui/alert.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { filesStore } from '$lib/stores/files.store';
	import type { Project } from '@sourcery/common/types/Project.type';

	export let form;
	export let data: { project: Project };
	let project;

	$: project = data.project;

	let showSuccess = false;
	let submitting = false;

	function handleEnhance() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			submitting = true;

			if (result.type === 'success') {
				await update();
				showSuccess = true;
				// Refresh the page to get the latest data
				// window.location.reload();
			} else {
				await update();
			}

			submitting = false;
		};
	}
</script>

<div>
	<div class="text-base/7 font-semibold text-gray-900 dark:text-white">Edit Project Settings</div>
	<div class="text-sm/6 text-gray-600 dark:text-gray-400">
		These settings will only apply to this project.
	</div>

	{#if form?.errors}
		<div class="mt-4">
			<Alert variant="error" title="Error" dismissible>
				There was an error updating the project settings. Please try again.
			</Alert>
		</div>
	{/if}

	<div class="mt-5">
		{#if project}
			<form method="POST" use:enhance={handleEnhance}>
				<ProjectSettings
					{form}
					initialData={{
						name: project.name,
						description: project.description ?? '',
						tags: project.tags ?? '',
						notes: project.notes ?? '',
						is_public: project.is_public,
						security: project.security
					}}
				/>
				<div class="mt-5">
					<ModelSettings
						{form}
						initialData={{
							chat_model: project.chat_model,
							vector_model: project.vector_model,
							temperature: project.temperature
						}}
						allow_vector_model_change={$filesStore.length === 0}
					/>
				</div>
				<button
					type="submit"
					class="mt-10 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
					disabled={submitting}
				>
					{#if submitting}
						Saving...
					{:else}
						Save
					{/if}
				</button>
			</form>
		{/if}
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="Project settings saved" />
