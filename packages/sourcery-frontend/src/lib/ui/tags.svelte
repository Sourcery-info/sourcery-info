<script lang="ts">
	export let value = '';
	export let placeholder = 'Type and press enter or comma to add tags';
	export let error = false;
	export let label = 'Tags';
	export let name = 'tags';

	let tagInput = '';
	$: tagArray = String(value || '')
		.split(',')
		.map((t) => t.trim())
		.filter((t) => t);

	function addTag(event: KeyboardEvent) {
		if ((event.key === ',' || event.key === 'Enter') && tagInput.trim()) {
			event.preventDefault();
			const newTag = tagInput.trim().replace(/,/g, '');
			if (newTag && !tagArray.includes(newTag)) {
				tagArray = [...tagArray, newTag];
				value = tagArray.join(',');
				tagInput = '';
			}
		}
	}

	function removeTag(index: number) {
		tagArray = tagArray.filter((_, i) => i !== index);
		value = tagArray.join(',');
	}
</script>

<div>
	{#if label}
		<label for={name} class="block text-sm font-medium leading-6 text-white">{label}</label>
	{/if}
	<div class="mt-2">
		<div
			class="flex flex-wrap gap-2 p-2 rounded-md bg-white/5 outline outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 {error
				? 'outline-red-500'
				: ''}"
		>
			{#each tagArray as tag, index}
				<div
					class="flex items-center gap-x-1 bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-md text-sm"
				>
					{tag}
					<button
						type="button"
						class="text-indigo-200 hover:text-white"
						on:click={() => removeTag(index)}
						aria-label="Remove tag {tag}"
					>
						<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
							<path
								d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
							/>
						</svg>
					</button>
				</div>
			{/each}
			<input
				type="text"
				id={name}
				bind:value={tagInput}
				on:keydown={addTag}
				{placeholder}
				class="flex-1 min-w-20 bg-transparent text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
			/>
		</div>
		<input type="hidden" {name} {value} />
	</div>
	<slot name="error" />
</div>
