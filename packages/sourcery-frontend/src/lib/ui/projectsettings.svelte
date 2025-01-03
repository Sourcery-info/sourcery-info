<script lang="ts">
	import Tags from '$lib/ui/tags.svelte';

	export let form;
	export let name = '';
	export let tags: string = '';
	export let description = '';
	export let notes = '';
	export let is_public = false;
	export let security;
</script>

<div class="space-y-6">
	<div>
		<label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>
		<div class="mt-2">
			<input
				type="text"
				name="name"
				id="name"
				bind:value={name}
				class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form
					?.errors?.name
					? 'outline-red-500'
					: ''}"
			/>
		</div>
		{#if form?.errors?.name}
			<p class="mt-2 text-sm text-red-500">{form.errors.name}</p>
		{/if}
	</div>

	<div class="flex gap-x-3">
		<div class="flex h-6 shrink-0 items-center">
			<div class="group grid size-4 grid-cols-1">
				<input
					type="checkbox"
					id="is_public"
					name="is_public"
					bind:checked={is_public}
					value="true"
					class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
			<label for="is_public" class="font-medium text-white text-sm/6">Public Project</label>
			<p class="text-sm/6 text-gray-400">
				Public projects are visible to everyone. They will be listed on the projects page.
			</p>
		</div>
	</div>

	<Tags bind:value={tags} error={!!form?.errors?.tags}>
		<p slot="error" class="mt-2 text-sm text-red-500">{form?.errors?.tags || ''}</p>
	</Tags>

	<div>
		<label for="description" class="block text-sm font-medium leading-6 text-white"
			>Description</label
		>
		<div class="mt-2">
			<textarea
				name="description"
				id="description"
				rows="3"
				bind:value={description}
				class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form
					?.errors?.description
					? 'outline-red-500'
					: ''}"
			></textarea>
		</div>
		{#if form?.errors?.description}
			<p class="mt-2 text-sm text-red-500">{form.errors.description}</p>
		{/if}
	</div>

	<div>
		<label for="notes" class="block text-sm font-medium leading-6 text-white">Notes</label>
		<div class="mt-2">
			<textarea
				name="notes"
				id="notes"
				rows="3"
				bind:value={notes}
				class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form
					?.errors?.notes
					? 'outline-red-500'
					: ''}"
			></textarea>
		</div>
		{#if form?.errors?.notes}
			<p class="mt-2 text-sm text-red-500">{form.errors.notes}</p>
		{/if}
	</div>

	<div>
		<label for="security" class="block text-sm/6 font-medium text-white">Security</label>
		<div class="mt-2 space-y-1">
			<div class="flex items-center gap-x-3">
				<input
					id="security-secure"
					name="security"
					type="radio"
					bind:group={security}
					value="secure"
					class="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
				/>
				<label for="security-secure" class="block text-sm/6 font-medium text-white">Secure</label>
			</div>
			<div class="flex items-center gap-x-3">
				<input
					id="security-insecure"
					name="security"
					type="radio"
					bind:group={security}
					value="insecure"
					class="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
				/>
				<label for="security-insecure" class="block text-sm/6 font-medium text-white"
					>Insecure - Internet access</label
				>
			</div>
		</div>
		{#if form?.errors?.security}
			<p class="mt-2 text-sm text-red-500">{form.errors.security}</p>
		{/if}
	</div>
</div>
