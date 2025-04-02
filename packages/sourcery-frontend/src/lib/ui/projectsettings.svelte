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
	import Tags from '$lib/ui/tags.svelte';

	export let form;
	export let initialData = {
		name: '',
		description: '',
		tags: '',
		notes: '',
		is_public: false,
		security: 'secure'
	};

	// Track form values
	let name = '';
	let description = '';
	let notes = '';
	let tags = '';

	// Update values when form data or initialData changes
	$: {
		const data = form?.data ?? initialData;
		name = data?.name ?? '';
		description = data?.description ?? '';
		notes = data?.notes ?? '';
		tags = data?.tags ?? '';
	}
</script>

<div class="space-y-6">
	<div>
		<label for="name" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
			>Name</label
		>
		<div class="mt-2">
			<input
				type="text"
				name="name"
				id="name"
				bind:value={name}
				class="block w-full rounded-md bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-1.5 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm/6 {form
					?.errors?.name
					? 'border-red-500 dark:border-red-500'
					: ''}"
			/>
		</div>
		{#if form?.errors?.name}
			<p class="mt-2 text-sm text-red-500">{form.errors.name[0]}</p>
		{/if}
	</div>

	<!-- <div class="flex gap-x-3">
		<div class="flex h-6 shrink-0 items-center">
			<div class="group grid size-4 grid-cols-1">
				<input
					type="checkbox"
					id="is_public"
					name="is_public"
					bind:checked={formState.is_public}
					value="true"
					class="col-start-1 row-start-1 appearance-none rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				/>
				<svg
					class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
					viewBox="0 0 14 14"
					fill="none"
				>
					<path
						class="opacity-0 group-has-[:checked]:opacity-100"
						d="M3 8L6 11L11 3.5"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		</div>
		<div class="flex flex-col gap-y-1">
			<label for="is_public" class="font-medium text-gray-900 dark:text-white text-sm/6"
				>Public Project</label
			>
			<p class="text-sm/6 text-gray-600 dark:text-gray-400">
				Public projects are visible to everyone. They will be listed on the projects page.
			</p>
		</div>
	</div> -->

	<Tags bind:value={tags} error={!!form?.errors?.tags}>
		<p slot="error" class="mt-2 text-sm text-red-500">{form?.errors?.tags?.[0] || ''}</p>
	</Tags>

	<div>
		<label
			for="description"
			class="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Description</label
		>
		<div class="mt-2">
			<textarea
				name="description"
				id="description"
				rows="3"
				bind:value={description}
				class="block w-full rounded-md bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-1.5 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm/6 {form
					?.errors?.description
					? 'border-red-500 dark:border-red-500'
					: ''}"
			></textarea>
		</div>
		{#if form?.errors?.description}
			<p class="mt-2 text-sm text-red-500">{form.errors.description[0]}</p>
		{/if}
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
			>Notes</label
		>
		<div class="mt-2">
			<textarea
				name="notes"
				id="notes"
				rows="3"
				bind:value={notes}
				class="block w-full rounded-md bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-1.5 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm/6 {form
					?.errors?.notes
					? 'border-red-500 dark:border-red-500'
					: ''}"
			></textarea>
		</div>
		{#if form?.errors?.notes}
			<p class="mt-2 text-sm text-red-500">{form.errors.notes[0]}</p>
		{/if}
	</div>

	<!-- <div>
		<label for="security" class="block text-sm/6 font-medium text-gray-900 dark:text-white"
			>Security</label
		>
		<div class="mt-2 space-y-1">
			<div class="flex items-center gap-x-3">
				<input
					id="security-secure"
					name="security"
					type="radio"
					bind:group={formState.security}
					value="secure"
					class="relative size-4 appearance-none rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-indigo-600 dark:before:bg-indigo-500 checked:border-indigo-600 checked:bg-white dark:checked:border-indigo-500 dark:checked:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
				/>
				<label
					for="security-secure"
					class="block text-sm/6 font-medium text-gray-900 dark:text-white">Secure</label
				>
			</div>
			<div class="flex items-center gap-x-3">
				<input
					id="security-insecure"
					name="security"
					type="radio"
					bind:group={formState.security}
					value="insecure"
					class="relative size-4 appearance-none rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-indigo-600 dark:before:bg-indigo-500 checked:border-indigo-600 checked:bg-white dark:checked:border-indigo-500 dark:checked:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
				/>
				<label
					for="security-insecure"
					class="block text-sm/6 font-medium text-gray-900 dark:text-white"
					>Insecure - Internet access</label
				>
			</div>
		</div>
		{#if form?.errors?.security}
			<p class="mt-2 text-sm text-red-500">{form.errors.security}</p>
		{/if}
	</div> -->
</div>
