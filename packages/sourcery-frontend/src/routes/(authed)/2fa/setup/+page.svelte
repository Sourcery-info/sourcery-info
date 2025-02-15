<!-- 2FA Setup Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { User } from '@sourcery/common/types/User.type';

	let qrCode: string = '';
	let secret: string = '';
	let backupCodes: string[] = [];
	let verificationCode: string = '';
	let verificationError: string = '';
	let setupError: string = '';
	let setupComplete = false;
	let showBackupCodes = false;

	onMount(async () => {
		try {
			const response = await fetch('/2fa', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) throw new Error('Failed to initialize 2FA');

			const data = await response.json();
			qrCode = data.qrCode;
			secret = data.secret;
			backupCodes = data.backupCodes;
		} catch (err: unknown) {
			if (err instanceof Error) {
				setupError = err.message;
			} else {
				setupError = 'An unexpected error occurred';
			}
		}
	});

	async function verifyAndEnable() {
		try {
			verificationError = ''; // Clear previous error
			const response = await fetch('/2fa', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: verificationCode })
			});

			if (!response.ok) {
				const data = await response.json();
				verificationError = data.message || 'Invalid verification code';
				return;
			}

			// Clear any errors and show success
			verificationError = '';
			setupError = '';
			setupComplete = true;
			showBackupCodes = true;
		} catch (err: unknown) {
			if (err instanceof Error) {
				verificationError = err.message;
			} else {
				verificationError = 'An unexpected error occurred';
			}
		}
	}

	function downloadBackupCodes() {
		const content = backupCodes.join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = '2fa-backup-codes.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function completeSetup() {
		// Reload the page to ensure all components reflect the updated 2FA status
		window.location.href = '/profile';
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
		Set Up Two-Factor Authentication
	</h1>

	{#if setupError}
		<div
			class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4"
			role="alert"
		>
			<span class="block sm:inline">{setupError}</span>
		</div>
	{/if}

	{#if !setupComplete}
		<div class="space-y-6">
			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Scan QR Code</h2>
				<p class="mb-4 text-gray-700 dark:text-gray-300">
					Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
				</p>
				{#if qrCode}
					<div class="bg-white p-4 rounded-lg inline-block mx-auto mb-4">
						<img src={qrCode} alt="2FA QR Code" class="mx-auto" />
					</div>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
						Can't scan the QR code? Enter this code manually: <code
							class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
							>{secret}</code
						>
					</p>
				{/if}
			</div>

			<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Verify Setup</h2>
				<p class="mb-4 text-gray-700 dark:text-gray-300">
					Enter the verification code from your authenticator app
				</p>
				<div class="space-y-4">
					<div>
						<input
							type="text"
							bind:value={verificationCode}
							placeholder="Enter 6-digit code"
							class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
							maxlength="6"
							pattern="[0-9]*"
						/>
						{#if verificationError}
							<p class="mt-2 text-sm text-red-600 dark:text-red-400">{verificationError}</p>
						{/if}
					</div>
					<button
						on:click={verifyAndEnable}
						class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
					>
						Verify and Enable 2FA
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showBackupCodes}
		<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
			<h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Backup Codes</h2>
			<p class="mb-4 text-red-600 dark:text-red-400 font-medium">
				Important: Save these backup codes in a secure place. They can be used to access your
				account if you lose your authenticator device.
			</p>
			<div class="grid grid-cols-2 gap-4 mb-6">
				{#each backupCodes as code}
					<div
						class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center font-mono text-gray-800 dark:text-gray-200"
					>
						{code}
					</div>
				{/each}
			</div>
			<div class="flex justify-between">
				<button
					on:click={downloadBackupCodes}
					class="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
				>
					Download Backup Codes
				</button>
				<button
					on:click={completeSetup}
					class="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
				>
					Complete Setup
				</button>
			</div>
		</div>
	{/if}
</div>
