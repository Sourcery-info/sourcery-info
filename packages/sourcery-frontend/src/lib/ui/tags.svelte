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
		<label for={name} class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
			>{label}</label
		>
	{/if}
	<div class="mt-2">
		<div
			class="flex flex-wrap gap-2 p-2 rounded-md bg-gray-50 dark:bg-white/5 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500 {error
				? 'outline-red-500'
				: ''}"
		>
			{#each tagArray as tag, index}
				<div
					class="flex items-center gap-x-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-md text-sm"
				>
					{tag}
					<button
						type="button"
						class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-200 dark:hover:text-white"
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
				class="flex-1 min-w-20 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
			/>
		</div>
		<input type="hidden" {name} {value} />
	</div>
	<slot name="error" />
</div>
