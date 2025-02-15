<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import ModelSettings from '$lib/ui/modelsettings.svelte';

	export let form: {
		message?: string;
		errors?: { [key: string]: string };
		data?: {
			name?: string;
			description?: string;
			notes?: string;
			is_public?: boolean;
			vector_model?: string;
			chat_model?: string;
			temperature?: number;
			security?: string;
			tags?: string;
		};
	} | null;

	let showSuccess = false;

	function handleSubmit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();
			if (result.type === 'success') {
				showSuccess = true;
			}
		};
	}

	$: project = form?.data ?? {
		name: '',
		description: '',
		notes: '',
		is_public: false,
		vector_model: '',
		chat_model: '',
		temperature: 0.7,
		security: 'secure',
		tags: ''
	};

	$: modelSettings = {
		chat_model: project.chat_model || '',
		vector_model: project.vector_model || '',
		temperature: project.temperature ?? 0.7
	};
</script>

<div class="px-6 py-12">
	<div>
		<h2 class="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
			Create New Project
		</h2>
	</div>

	<div class="mt-10 max-w-2xl">
		<form use:enhance={handleSubmit} method="POST" class="space-y-6">
			{#if form?.message}
				<div class="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
					{form.message}
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Name</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="name"
						name="name"
						bind:value={project.name}
						required
						class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.name}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.name}</p>
				{/if}
			</div>

			<div>
				<label
					for="description"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Description</label
				>
				<div class="mt-2">
					<textarea
						id="description"
						name="description"
						rows="3"
						bind:value={project.description}
						class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
					></textarea>
				</div>
				{#if form?.errors?.description}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.description}</p>
				{/if}
			</div>

			<div>
				<label for="notes" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Notes</label
				>
				<div class="mt-2">
					<textarea
						id="notes"
						name="notes"
						rows="3"
						bind:value={project.notes}
						class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
					></textarea>
				</div>
				{#if form?.errors?.notes}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.notes}</p>
				{/if}
			</div>

			<div>
				<label for="tags" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Tags</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="tags"
						name="tags"
						bind:value={project.tags}
						class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.tags}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.tags}</p>
				{/if}
			</div>

			<ModelSettings
				{form}
				initialData={{
					chat_model: project.chat_model ?? '',
					vector_model: project.vector_model ?? '',
					temperature: project.temperature ?? 0.1
				}}
			/>

			<div class="space-y-4">
				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="is_public"
						value={1}
						bind:checked={project.is_public}
						class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-gray-900 dark:text-white">Public</span>
				</label>

				<div>
					<label
						for="security"
						class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
						>Security</label
					>
					<div class="mt-2">
						<select
							id="security"
							name="security"
							bind:value={project.security}
							required
							class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
						>
							<option value="secure">Secure</option>
							<option value="insecure">Insecure</option>
						</select>
					</div>
					{#if form?.errors?.security}
						<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.security}</p>
					{/if}
				</div>
			</div>

			<div class="flex space-x-4">
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					Create Project
				</button>
				<a
					href="/admin/projects/list"
					class="flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="Project created successfully" />
