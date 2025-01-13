<script>
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import Projectsettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import { enhance } from '$app/forms';
	import { AIModels } from '@sourcery/common/src/ai-models';

	export let form;

	let chat_model =
		AIModels.find((model) => model.type === 'chat' && model.default)?.value ||
		AIModels.find((model) => model.type === 'chat')?.value;
	let vector_model =
		AIModels.find((model) => model.type === 'embed' && model.default)?.value ||
		AIModels.find((model) => model.type === 'embed')?.value;
	let temperature = 0.1;
	let security = 'secure';
</script>

<div>
	<div class="text-base/7 font-semibold text-gray-900 dark:text-white">New Project</div>
	<div class="mt-10">
		<form method="POST" use:enhance>
			<div class="flex flex-col gap-4">
				<Projectsettings bind:form />
			</div>
			<div class="flex flex-col gap-4">
				<ModelSettings bind:form {chat_model} {vector_model} {temperature} {security} />
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
