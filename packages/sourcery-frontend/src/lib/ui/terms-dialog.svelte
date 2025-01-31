<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TermsAndConditions } from '@sourcery/common/types/TermsAndConditions.type';

	export let terms: TermsAndConditions;
	export let userId: string;
	export let show = false;

	const dispatch = createEventDispatcher();

	async function handleAccept() {
		try {
			const response = await fetch('/terms/accept', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user_id: userId,
					user_agent: navigator.userAgent
				})
			});

			if (!response.ok) {
				throw new Error('Failed to accept terms');
			}

			dispatch('accepted');
			show = false;
		} catch (error) {
			console.error('Error accepting terms:', error);
		}
	}

	function handleDecline() {
		dispatch('declined');
		show = false;
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50" />
	<div class="fixed inset-0 z-50 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
			>
				<div>
					<div class="mt-3 text-center sm:mt-5">
						<h3 class="text-2xl font-semibold leading-6 text-gray-900 dark:text-white mb-4">
							Terms & Conditions
						</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
								Please read and accept our Terms & Conditions to continue using the service.
							</p>
							<div
								class="prose prose-sm dark:prose-invert max-w-none text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-md max-h-96 overflow-y-auto"
							>
								{#if terms.content}
									<div class="whitespace-pre-wrap">{terms.content}</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
					<button
						type="button"
						class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
						on:click={handleAccept}
					>
						Accept
					</button>
					<button
						type="button"
						class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
						on:click={handleDecline}
					>
						Decline
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
