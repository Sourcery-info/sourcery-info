<script lang="ts">
	import { enhance } from '$app/forms';

	/** @type {import('./$types').PageData} */
	export let data;

	export let form: {
		message?: string;
		errors?: { [key: string]: string };
	} | null;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="text-center text-2xl font-bold leading-9 tracking-tight text-white">Edit Project</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form use:enhance method="POST" class="space-y-6">
			{#if form?.message}
				<div class="p-4 bg-red-900/50 text-red-200 rounded-lg">
					{form.message}
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>
				<div class="mt-2">
					<input
						type="text"
						id="name"
						name="name"
						value={data.project?.name}
						required
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.name}
					<p class="mt-2 text-sm text-red-500">{form.errors.name}</p>
				{/if}
			</div>

			<div>
				<label for="description" class="block text-sm font-medium leading-6 text-white"
					>Description</label
				>
				<div class="mt-2">
					<textarea
						id="description"
						name="description"
						rows="3"
						value={data.project?.description}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
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
						id="notes"
						name="notes"
						rows="3"
						value={data.project?.notes}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					></textarea>
				</div>
				{#if form?.errors?.notes}
					<p class="mt-2 text-sm text-red-500">{form.errors.notes}</p>
				{/if}
			</div>

			<div>
				<label for="chat_model" class="block text-sm font-medium leading-6 text-white"
					>Chat Model</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="chat_model"
						name="chat_model"
						value={data.project?.chat_model}
						required
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.chat_model}
					<p class="mt-2 text-sm text-red-500">{form.errors.chat_model}</p>
				{/if}
			</div>

			<div>
				<label for="vector_model" class="block text-sm font-medium leading-6 text-white"
					>Vector Model</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="vector_model"
						name="vector_model"
						value={data.project?.vector_model}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.vector_model}
					<p class="mt-2 text-sm text-red-500">{form.errors.vector_model}</p>
				{/if}
			</div>

			<div>
				<label for="temperature" class="block text-sm font-medium leading-6 text-white"
					>Temperature</label
				>
				<div class="mt-2">
					<input
						type="number"
						id="temperature"
						name="temperature"
						min="0"
						max="1"
						step="0.1"
						value={data.project?.temperature}
						required
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.temperature}
					<p class="mt-2 text-sm text-red-500">{form.errors.temperature}</p>
				{/if}
			</div>

			<div>
				<label for="tags" class="block text-sm font-medium leading-6 text-white">Tags</label>
				<div class="mt-2">
					<input
						type="text"
						id="tags"
						name="tags"
						value={data.project?.tags}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.tags}
					<p class="mt-2 text-sm text-red-500">{form.errors.tags}</p>
				{/if}
			</div>

			<div class="space-y-4">
				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="is_public"
						value={1}
						checked={data.project?.is_public}
						class="w-4 h-4 rounded border-gray-300 bg-white/5 text-indigo-500 focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-white">Public</span>
				</label>

				<div>
					<label for="security" class="block text-sm font-medium leading-6 text-white"
						>Security</label
					>
					<div class="mt-2">
						<select
							id="security"
							name="security"
							required
							class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
						>
							<option value="secure" selected={data.project?.security === 'secure'}>Secure</option>
							<option value="insecure" selected={data.project?.security === 'insecure'}
								>Insecure</option
							>
						</select>
					</div>
					{#if form?.errors?.security}
						<p class="mt-2 text-sm text-red-500">{form.errors.security}</p>
					{/if}
				</div>
			</div>

			<div class="flex space-x-4">
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					Save Changes
				</button>
				<a
					href="/admin/projects/list"
					class="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
