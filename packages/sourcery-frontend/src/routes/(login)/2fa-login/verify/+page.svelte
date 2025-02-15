<!-- 2FA Login Verification Page -->
<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	let isBackupCode = false;
</script>

<div class="container mx-auto px-4 py-8 max-w-md">
	<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
		<h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Two-Factor Authentication</h1>

		{#if form?.state === 'error'}
			<div
				class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"
				role="alert"
			>
				<span class="block sm:inline">{form.message}</span>
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<input type="hidden" name="userId" value={data.userId} />
			<div>
				{#if !isBackupCode}
					<label for="code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Enter the verification code from your authenticator app
					</label>
					<input
						id="code"
						name="code"
						type="text"
						placeholder="Enter 6-digit code"
						class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
						maxlength="6"
						pattern="[0-9]*"
						autocomplete="off"
					/>
				{:else}
					<label for="code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Enter one of your backup codes
					</label>
					<input
						id="code"
						name="code"
						type="text"
						placeholder="Enter backup code"
						class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
						autocomplete="off"
					/>
				{/if}
			</div>

			<button
				type="submit"
				class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
			>
				Verify
			</button>

			<button
				type="button"
				on:click={() => (isBackupCode = !isBackupCode)}
				class="w-full text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
			>
				{isBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
			</button>
		</form>
	</div>
</div>
