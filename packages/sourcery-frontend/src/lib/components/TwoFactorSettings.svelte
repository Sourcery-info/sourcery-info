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

<!-- Two-Factor Authentication Settings Component -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { SourceryAccount } from '$lib/types/SourcerySettings.type';

	export let user: SourceryAccount;

	let password: string = '';
	let error: string = '';
	let success: string = '';
	let disableError: string = '';
	let disableSuccess: string = '';

	function showDisableModal() {
		disableError = '';
		disableSuccess = '';
		password = '';
		const modal = document.getElementById('disable2faModal') as HTMLDialogElement;
		if (modal) modal.showModal();
	}

	function closeModal() {
		password = '';
		const modal = document.getElementById('disable2faModal') as HTMLDialogElement;
		if (modal) modal.close();
	}

	async function disable2FA() {
		try {
			const response = await fetch('/2fa', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				disableError = 'Failed to disable 2FA. Please check your password.';
				return;
			}

			disableSuccess = '2FA has been disabled successfully';
			user.two_factor_enabled = false;
			password = '';
			closeModal();
		} catch (err: unknown) {
			if (err instanceof Error) {
				disableError = err.message;
			} else {
				disableError = 'An unexpected error occurred';
			}
		}
	}
</script>

<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
	<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
		Two-Factor Authentication
	</h2>

	{#if error}
		<div
			class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"
			role="alert"
		>
			<span class="block sm:inline">{error}</span>
		</div>
	{/if}

	{#if success}
		<div
			class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4"
			role="alert"
		>
			<span class="block sm:inline">{success}</span>
		</div>
	{/if}

	<div class="space-y-4">
		{#if user.two_factor_enabled}
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-green-600 dark:text-green-400">
						✓ Two-factor authentication is enabled
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Your account is protected with an authenticator app
					</p>
				</div>
				<button
					class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
					on:click={showDisableModal}
				>
					Disable
				</button>
			</div>
		{:else}
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-gray-600 dark:text-gray-300">
						Two-factor authentication is disabled
					</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Add an extra layer of security to your account
					</p>
				</div>
				<a
					href="/2fa/setup"
					class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
				>
					Enable
				</a>
			</div>
		{/if}
	</div>
</div>

<!-- Disable 2FA Modal -->
<dialog
	id="disable2faModal"
	class="p-0 rounded-lg shadow-xl backdrop:bg-gray-500/50 dark:bg-gray-800"
>
	{#if disableError}
		<div
			class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"
			role="alert"
		>
			<span class="block sm:inline">{disableError}</span>
		</div>
	{/if}

	{#if disableSuccess}
		<div
			class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4"
			role="alert"
		>
			<span class="block sm:inline">{disableSuccess}</span>
		</div>
	{/if}
	<div class="w-full max-w-md p-6">
		<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
			Disable Two-Factor Authentication
		</h3>
		<p class="text-gray-600 dark:text-gray-400 mb-4">
			Please enter your password to confirm disabling 2FA.
		</p>

		<div class="space-y-4">
			<input
				type="password"
				bind:value={password}
				placeholder="Enter your password"
				class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
				autocomplete="off"
				on:keypress={(event: KeyboardEvent) => {
					if (password.length > 0 && event.key === 'Enter') {
						event.preventDefault();
						event.stopPropagation();
						disable2FA();
					}
				}}
			/>

			<div class="flex justify-end space-x-4">
				<button
					class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
					on:click={closeModal}
				>
					Cancel
				</button>
				<button
					class="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
					on:click={disable2FA}
				>
					Disable 2FA
				</button>
			</div>
		</div>
	</div>
</dialog>
