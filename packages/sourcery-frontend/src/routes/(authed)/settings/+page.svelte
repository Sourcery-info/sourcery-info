<!--
 Copyright (C) 2025 Jason Norwood-Young
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	// @ts-nocheck
	import ModelSettings from '$lib/ui/modelsettings.svelte';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import { enhance } from '$app/forms';

	export let form;
	export let data: { props: { settings: Settings } };

	let showSuccess = false;

	$: settings = data.props.settings;

	function handleSubmit() {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				showSuccess = true;
			}
		};
	}
</script>

<div>
	<h1 class="text-base/7 font-semibold text-gray-900 dark:text-white">Default Settings</h1>
	<p class="text-sm/6 text-gray-600 dark:text-gray-400 mb-3">
		These settings will be applied by default to new projects. They will not affect the settings of
		existing projects.
	</p>
	<form method="POST" use:enhance={handleSubmit} class="mt-10">
		<ModelSettings
			{form}
			initialData={{
				chat_model: settings.chat_model,
				vector_model: settings.vector_model,
				temperature: settings.temperature
			}}
			allow_vector_model_change={true}
		/>
		<button
			type="submit"
			class="mt-10 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
		>
			Save
		</button>
	</form>
</div>

<SuccessAlert bind:show={showSuccess} message="Settings saved" />
