<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	export let data: PageData;
	export let form: ActionData;

	let saving = false;
</script>

<div class="container mx-auto px-4 py-8 bg-gray-900 text-gray-100 min-h-screen">
	<h1 class="text-2xl font-bold mb-6 text-white">System Configuration</h1>

	<form method="POST" use:enhance class="space-y-12 max-w-3xl">
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
									value={config.value}
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
				disabled={saving}
				class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Save Configuration'}
			</button>
		</div>
	</form>
</div>
