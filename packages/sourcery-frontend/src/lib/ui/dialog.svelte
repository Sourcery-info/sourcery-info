<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let show = false;
	export let title: string;
	export let message: string;
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';
	export let confirmClass = 'bg-red-600 hover:bg-red-500';
	export let icon: keyof typeof icons = 'warning';
	export let type: 'warning' | 'error' = 'warning';
	export let showCancel = true;
	export let form: HTMLFormElement | null = null;

	const dispatch = createEventDispatcher();
	import { createEventDispatcher } from 'svelte';

	const icons = {
		warning: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />`,
		error: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />`
	} as const;

	$: iconBgColor = type === 'error' ? 'bg-red-100' : 'bg-red-100';
	$: iconColor = type === 'error' ? 'text-red-600' : 'text-red-600';

	function close() {
		dispatch('close');
	}

	function confirm() {
		if (form) {
			form.requestSubmit();
		}
		dispatch('confirm');
	}
</script>

{#if show}
	<div
		class="relative z-10"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="fixed inset-0 bg-gray-900/75 transition-opacity"
			aria-hidden="true"
			transition:fade={{ duration: 200 }}
		/>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
					transition:fly={{ y: 40, duration: 300, easing: quintOut }}
				>
					<div class="sm:flex sm:items-start">
						<div
							class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full {iconBgColor} sm:mx-0 sm:h-10 sm:w-10"
						>
							<svg
								class="h-6 w-6 {iconColor}"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								{@html icons[icon]}
							</svg>
						</div>
						<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
							<h3 class="text-base font-semibold leading-6 text-gray-200" id="modal-title">
								{title}
							</h3>
							<div class="mt-2">
								<p class="text-sm text-gray-400">
									{message}
								</p>
							</div>
						</div>
					</div>
					<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
						<button
							type="button"
							on:click={confirm}
							class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto {confirmClass}"
						>
							{confirmText}
						</button>
						{#if showCancel}
							<button
								type="button"
								on:click={close}
								class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-200 shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:mt-0 sm:w-auto"
							>
								{cancelText}
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
