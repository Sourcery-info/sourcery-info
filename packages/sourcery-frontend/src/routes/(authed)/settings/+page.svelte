<script>
	// @ts-nocheck
	import Cardcontainer from '$lib/ui/cardcontainer.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import { enhance } from '$app/forms';

	export let form;
	export let data;
</script>

<Cardcontainer>
	<div slot="title">
		<h1 class="text-base/7 font-semibold text-white">Default Settings</h1>
		<p class="text-sm/6 text-gray-400">
			These settings will be applied by default to new projects. They will not affect the settings
			of existing projects.
		</p>
	</div>
	<form method="POST" use:enhance class="mt-10">
		<ModelSettings
			bind:form
			bind:chat_model={data.props.settings.chat_model}
			bind:vector_model={data.props.settings.vector_model}
			bind:temperature={data.props.settings.temperature}
			bind:security={data.props.settings.security}
		/>
		<button
			type="submit"
			class="mt-10 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
		>
			Submit
		</button>
	</form>
</Cardcontainer>
