<script lang="ts">
	import ProjectSettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { filesStore } from '$lib/stores/files';

	export let form;
	export let data;

	let showSuccess = false;

	const handleSubmit: SubmitFunction = () => {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				showSuccess = true;
			}
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
			<form method="POST" use:enhance={handleSubmit}>
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
					class="mt-10 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					Save
				</button>
			</form>
		{/if}
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="Project settings saved" />
