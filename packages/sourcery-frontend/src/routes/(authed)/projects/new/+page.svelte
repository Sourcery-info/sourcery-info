<script>
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import Projectsettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import { enhance, applyAction } from '$app/forms';
	import { AIModels } from '@sourcery/common/src/ai-models';
	import Alert from '$lib/ui/alert.svelte';

	export let form;
	export let data;
	let error = '';

	let name = form?.data?.name ?? '';
	let description = form?.data?.description ?? '';
	let tags = form?.data?.tags ?? '';
	let notes = form?.data?.notes ?? '';

	function handleEnhance() {
		return async ({ result }) => {
			// Apply the form action result which will automatically update the form prop
			await applyAction(result);
		};
	}

	let chat_model =
		data.settings?.chat_model ||
		AIModels.find((model) => model.type === 'chat' && model.default)?.value ||
		AIModels.find((model) => model.type === 'chat')?.value;
	let vector_model =
		data.settings?.vector_model ||
		AIModels.find((model) => model.type === 'embed' && model.default)?.value ||
		AIModels.find((model) => model.type === 'embed')?.value;
	let temperature = data.settings?.temperature ?? 0.1;
</script>

<div>
	<div class="text-base/7 font-semibold text-gray-900 dark:text-white">New Project</div>
	{#if error}
		<div class="mt-4">
			<Alert variant="error" title="Error" dismissible>
				{error}
			</Alert>
		</div>
	{/if}
	<div class="mt-10">
		<form method="POST" use:enhance={handleEnhance}>
			<div class="flex flex-col gap-4 mb-10">
				<Projectsettings {form} />
			</div>
			<div class="flex flex-col gap-4">
				<ModelSettings
					bind:form
					initialData={{
						chat_model: chat_model,
						vector_model: vector_model,
						temperature: temperature
					}}
				/>
			</div>
			<button
				type="submit"
				class="mt-10 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
			>
				Save
			</button>
		</form>
	</div>
</div>
