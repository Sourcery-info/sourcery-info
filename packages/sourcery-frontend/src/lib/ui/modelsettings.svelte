<script>
	// @ts-nocheck
	import { AIModels } from '@sourcery/common/src/ai-models';

	export let form;

	export let chat_model;
	export let vector_model;
	export let allow_vector_model_change = true;
	export let temperature;

	const chatModels = AIModels.filter((model) => model.type === 'chat').sort((a, b) =>
		a.default ? -1 : b.default ? 1 : 0
	);
	const vectorModels = AIModels.filter((model) => model.type === 'embed').sort((a, b) =>
		a.default ? -1 : b.default ? 1 : 0
	);
	const temperatureStep = 0.1;
	const temperatureMin = 0;
	const temperatureMax = 1.0;
</script>

<div class="space-y-6">
	<div class="sm:col-span-4">
		<label for="chat_model" class="block text-sm/6 font-medium text-white">Chat Model</label>
		<div class="mt-2 grid grid-cols-1">
			<select
				name="chat_model"
				id="chat_model"
				bind:value={chat_model}
				class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
			>
				{#each chatModels as model}
					<option value={model.value}>{model.name}</option>
				{/each}
			</select>
			<svg
				class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		{#if form?.errors?.chat_model}
			<p class="mt-2 text-sm text-red-500">{form.errors.chat_model}</p>
		{/if}
	</div>

	<div class="sm:col-span-4">
		<label for="vector_model" class="block text-sm/6 font-medium text-white">Vector Model</label>
		{#if allow_vector_model_change}
			<div class="mt-2 grid grid-cols-1">
				<select
					name="vector_model"
					id="vector_model"
					bind:value={vector_model}
					class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
				>
					{#each vectorModels as model}
						<option value={model.value}>{model.name}</option>
					{/each}
				</select>
				<svg
					class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
					viewBox="0 0 16 16"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			{#if form?.errors?.vector_model}
				<p class="mt-2 text-sm text-red-500">{form.errors.vector_model}</p>
			{/if}
		{:else}
			<input
				type="text"
				name="vector_model"
				id="vector_model"
				bind:value={vector_model}
				disabled
				class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
			/>
			<div class="mt-2 text-sm text-gray-400">
				You cannot change the embedding model because you have already vectorized documents with it.
			</div>
		{/if}
	</div>

	<div class="sm:col-span-4">
		<label for="temperature" class="block text-sm/6 font-medium text-white"
			>Temperature: {temperature}</label
		>
		<div class="mt-2">
			<input
				type="range"
				name="temperature"
				id="temperature"
				bind:value={temperature}
				step={temperatureStep}
				min={temperatureMin}
				max={temperatureMax}
				class="w-full appearance-none bg-white/5 rounded-lg h-2 accent-indigo-500"
			/>
		</div>
		{#if form?.errors?.temperature}
			<p class="mt-2 text-sm text-red-500">{form.errors.temperature}</p>
		{/if}
	</div>
</div>
