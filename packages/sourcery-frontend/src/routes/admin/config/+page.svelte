<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import SuccessAlert from '$lib/ui/success-alert.svelte';

	export let data: PageData;
	export let form: ActionData;

	let showSuccess = false;

	function handleSubmit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();
			if (result.type === 'success') {
				showSuccess = true;
			}
		};
	}
</script>

<div class="px-6 py-12">
	<div>
		<h2 class="text-2xl font-bold leading-9 tracking-tight text-white">System Configuration</h2>
	</div>

	<div class="mt-10 max-w-3xl">
		<form method="POST" use:enhance={handleSubmit} class="space-y-12">
			{#if form?.message}
				<div class="p-4 bg-red-900/50 text-red-200 rounded-lg">
					{form.message}
				</div>
			{/if}

			{#each Object.entries(data.configsByCategory) as [category, configs]}
				<div class="space-y-6">
					<h2 class="text-xl font-semibold text-white border-b border-gray-700 pb-2">{category}</h2>
					<div class="space-y-8">
						{#each configs as config}
							<div>
								<div class="flex items-baseline justify-between">
									<label for={config.key} class="block text-sm font-medium leading-6 text-white">
										{config.name}
										{#if config.required}
											<span class="text-red-500 ml-1">*</span>
										{/if}
									</label>
									{#if config.isEnv}
										<span class="text-xs text-yellow-500">Set in environment</span>
									{/if}
								</div>
								<div class="mt-2">
									<input
										type={config.type}
										name={config.key}
										id={config.key}
										bind:value={config.value}
										placeholder={config.placeholder}
										required={config.required}
										readonly={config.isEnv}
										class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed {config.isEnv
											? 'opacity-50 cursor-not-allowed'
											: ''} {form?.errors?.[config.key] ? 'outline-red-500' : ''}"
									/>
									{#if form?.errors?.[config.key]}
										<p class="mt-2 text-sm text-red-500">{form.errors[config.key]}</p>
									{/if}
								</div>
								{#if config.description}
									<p class="mt-2 text-sm text-gray-400">{config.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<div class="pt-4">
				<button
					type="submit"
					class="rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					Save Configuration
				</button>
			</div>
		</form>
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="Configuration saved successfully" />
