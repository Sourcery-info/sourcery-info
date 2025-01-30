<script lang="ts">
	import ProjectSettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { filesStore } from '$lib/stores/files';

	export let form;
	export let data;

	let showSuccess = false;
	let isSubmitting = false;

	const handleSubmit = () => {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			isSubmitting = true;
			await update();
			if (result.type === 'success') {
				showSuccess = true;
			}
			isSubmitting = false;
		};
	};
</script>

<div>
	<div class="text-base/7 font-semibold text-gray-900 dark:text-white">Edit Project Settings</div>
	<div class="text-sm/6 text-gray-600 dark:text-gray-400">
		These settings will only apply to this project.
	</div>

	<div class="mt-5">
		{#if data.project}
			<form method="POST" use:enhance={handleSubmit} class="relative">
				{#if isSubmitting}
					<div
						class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10"
					>
						<svg
							class="size-8 animate-spin text-indigo-600 dark:text-indigo-500"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				{/if}
				<ProjectSettings
					bind:form
					bind:name={data.project.name}
					bind:tags={data.project.tags}
					bind:description={data.project.description}
					bind:notes={data.project.notes}
					bind:is_public={data.project.is_public}
					bind:security={data.project.security}
				/>
				<div class="mt-5">
					<ModelSettings
						bind:form
						bind:chat_model={data.project.chat_model}
						bind:vector_model={data.project.vector_model}
						bind:temperature={data.project.temperature}
						allow_vector_model_change={$filesStore.length === 0}
					/>
				</div>
				<button
					type="submit"
					class="mt-10 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				>
					{#if isSubmitting}
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
