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
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import SuccessAlert from '$lib/ui/success-alert.svelte';

	export let form: {
		message?: string;
		errors?: { [key: string]: string };
		data?: {
			username?: string;
			name?: string;
			email?: string;
			approved?: boolean;
			admin?: boolean;
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

	$: user = form?.data ?? {
		username: '',
		name: '',
		email: '',
		approved: false,
		admin: false
	};
</script>

<div class="px-6 py-12">
	<div>
		<h2 class="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
			Create New User
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
				<label
					for="username"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Username</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="username"
						name="username"
						required
						bind:value={user.username}
						class="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.username}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.username}</p>
				{/if}
			</div>

			<div>
				<label for="name" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Name</label
				>
				<div class="mt-2">
					<input
						type="text"
						id="name"
						name="name"
						required
						bind:value={user.name}
						class="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.name}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.name}</p>
				{/if}
			</div>

			<div>
				<label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Email</label
				>
				<div class="mt-2">
					<input
						type="email"
						id="email"
						name="email"
						required
						bind:value={user.email}
						class="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.email}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.email}</p>
				{/if}
			</div>

			<div>
				<label
					for="password"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Password</label
				>
				<div class="mt-2">
					<input
						type="password"
						id="password"
						name="password"
						required
						class="block w-full rounded-md border-0 py-1.5 px-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.password}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.password}</p>
				{/if}
			</div>

			<hr class="border-gray-200 dark:border-white/10" />

			<div class="space-y-4">
				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="approved"
						value={1}
						bind:checked={user.approved}
						class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 text-indigo-500 focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-gray-900 dark:text-white">Approved</span>
				</label>

				<label class="flex items-center space-x-3">
					<input
						type="checkbox"
						name="admin"
						value={1}
						bind:checked={user.admin}
						class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 text-indigo-500 focus:ring-indigo-500"
					/>
					<span class="text-sm font-medium text-gray-900 dark:text-white">Admin</span>
				</label>
			</div>

			<div class="flex space-x-4">
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
				>
					Create User
				</button>
				<a
					href="/admin/users/list"
					class="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-400"
				>
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="User created successfully" />
