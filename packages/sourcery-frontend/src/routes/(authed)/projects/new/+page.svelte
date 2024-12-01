<script>
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import Projectsettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import { enhance } from '$app/forms';

	export let form;

	import models from '$lib/models.json';
	let chat_model = models.filter((model) => model.type === 'chat')[0].value;
	let vector_model = models.filter((model) => model.type === 'embed')[0].value;
	let temperature = 0.1;
	let security = 'secure';
</script>

<div>
	<div class="text-base/7 font-semibold text-white">New Project</div>
	<div class="mt-10">
		<form method="POST" use:enhance>
			<Projectsettings bind:form />
			<ModelSettings bind:form {chat_model} {vector_model} {temperature} {security} />
			<button
				type="submit"
				class="mt-10 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
			>
				Submit
			</button>
		</form>
	</div>
</div>
