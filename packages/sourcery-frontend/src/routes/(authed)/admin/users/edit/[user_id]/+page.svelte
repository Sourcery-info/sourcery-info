<script lang="ts">
	/** @type {import('./$types').PageData} */
	import { enhance } from '$app/forms';

	export let form: {
		message?: string;
		errors?: { [key: string]: string };
	} | null;

	export let data;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="text-center text-2xl font-bold leading-9 tracking-tight text-white">Edit User</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form use:enhance method="POST" class="space-y-6">
			{#if form?.message}
				<div class="p-4 bg-red-900/50 text-red-200 rounded-lg">
					{form.message}
				</div>
			{/if}

			<div>
				<label for="username" class="block text-sm font-medium leading-6 text-white">Username</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="username"
						name="username"
						value={data.user?.username}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.username}
					<p class="mt-2 text-sm text-red-500">{form.errors.username}</p>
				{/if}
			</div>

			<div>
				<label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>
				<div class="mt-2">
					<input
						type="text"
						id="name"
						name="name"
						value={data.user?.name}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.name}
					<p class="mt-2 text-sm text-red-500">{form.errors.name}</p>
				{/if}
			</div>

			<div>
				<label for="email" class="block text-sm font-medium leading-6 text-white">Email</label>
				<div class="mt-2">
					<input
						type="email"
						id="email"
						name="email"
						value={data.user?.email}
						class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.email}
					<p class="mt-2 text-sm text-red-500">{form.errors.email}</p>
				{/if}
			</div>

			<hr class="border-white/10" />

			<div class="space-y-4">
				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="approved"
						value={1}
						checked={data.user?.approved}
						class="w-4 h-4 rounded border-gray-300 bg-white/5 text-indigo-500 focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-white">Approved</span>
				</label>
				{#if form?.errors?.approved}
					<p class="mt-2 text-sm text-red-500">{form.errors.approved}</p>
				{/if}

				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="admin"
						value={1}
						checked={data.user?.admin}
						class="w-4 h-4 rounded border-gray-300 bg-white/5 text-indigo-500 focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-white">Admin</span>
				</label>
				{#if form?.errors?.admin}
					<p class="mt-2 text-sm text-red-500">{form.errors.admin}</p>
				{/if}
			</div>

			<div class="flex space-x-4">
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					Save Changes
				</button>
				<a
					href="/admin/users/list"
					class="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>
