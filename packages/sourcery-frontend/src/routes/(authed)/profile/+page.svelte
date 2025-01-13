<script lang="ts">
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/ui/theme-toggle.svelte';
	interface FormErrors {
		username?: string;
		email?: string;
		name?: string;
		currentPassword?: string;
		confirmPassword?: string;
		newPassword?: string;
		form?: string;
	}

	export let form: { errors?: FormErrors; data?: Record<string, string> };
	export let data;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2
			class="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white"
		>
			Profile Settings
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" method="POST" action="?/updateProfile" use:enhance>
			<div>
				<label
					for="username"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Username</label
				>
				<div class="mt-2">
					<input
						id="username"
						name="username"
						type="text"
						value={form?.data?.username || data.user?.username || ''}
						required
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.username}
					<p class="mt-2 text-sm text-red-500">{form.errors.username}</p>
				{/if}
			</div>

			<div>
				<label for="name" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Full Name</label
				>
				<div class="mt-2">
					<input
						id="name"
						name="name"
						type="text"
						value={form?.data?.name || data.user?.name || ''}
						required
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.name}
					<p class="mt-2 text-sm text-red-500">{form.errors.name}</p>
				{/if}
			</div>

			<div>
				<label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Email</label
				>
				<div class="mt-2">
					<input
						id="email"
						name="email"
						type="email"
						value={form?.data?.email || data.user?.email || ''}
						required
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.email}
					<p class="mt-2 text-sm text-red-500">{form.errors.email}</p>
				{/if}
			</div>

			<hr class="border-gray-200 dark:border-gray-700" />

			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Change Password</h3>
				<label
					for="currentPassword"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white mt-4"
					>Current Password</label
				>
				<div class="mt-2">
					<input
						id="currentPassword"
						name="currentPassword"
						type="password"
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.currentPassword}
					<p class="mt-2 text-sm text-red-500">{form.errors.currentPassword}</p>
				{/if}
			</div>

			<div>
				<label
					for="newPassword"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>New Password</label
				>
				<div class="mt-2">
					<input
						id="newPassword"
						name="newPassword"
						type="password"
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.newPassword}
					<p class="mt-2 text-sm text-red-500">{form.errors.newPassword}</p>
				{/if}
			</div>

			<div>
				<label
					for="confirmPassword"
					class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Confirm New Password</label
				>
				<div class="mt-2">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						class="block w-full rounded-md border-0 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
					/>
				</div>
				{#if form?.errors?.confirmPassword}
					<p class="mt-2 text-sm text-red-500">{form.errors.confirmPassword}</p>
				{/if}
			</div>

			<div>
				<label for="theme" class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>Theme</label
				>
				<div class="mt-2">
					<ThemeToggle />
				</div>
			</div>

			{#if form?.errors?.form}
				<p class="text-sm text-red-500">{form.errors.form}</p>
			{/if}

			<div>
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					Save Changes
				</button>
			</div>
		</form>
	</div>
</div>
