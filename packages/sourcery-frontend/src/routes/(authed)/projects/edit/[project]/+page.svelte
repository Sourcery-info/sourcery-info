<script>
	import Projectsettings from '$lib/ui/projectsettings.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import { enhance } from '$app/forms';

	export let form;
	export let data;
</script>

<div>
	<div class="text-base/7 font-semibold text-white">Edit Project Settings</div>
	<div class="text-sm/6 text-gray-400">
		Note that if you change the vector model, you will need to re-index your documents.
	</div>

	<div class="mt-10">
		{#if data.project}
			<form method="POST" use:enhance>
				<Projectsettings
					bind:form
					bind:name={data.project.name}
					bind:tags={data.project.tags}
					bind:description={data.project.description}
					bind:notes={data.project.notes}
				/>
				<ModelSettings
					bind:form
					bind:chat_model={data.project.chat_model}
					bind:vector_model={data.project.vector_model}
					bind:temperature={data.project.temperature}
					bind:security={data.project.security}
				/>
				<button
					type="submit"
					class="mt-10 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					Submit
				</button>
			</form>
		{/if}
	</div>
</div>
