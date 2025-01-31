<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { filesStore } from '$lib/stores/files.store';
	import { projectsStore } from '$lib/stores/projects.store';
	import { entitiesStore } from '$lib/stores/entities.store';
	import { conversationsStore } from '$lib/stores/conversations.store';
	import { alertsStore } from '$lib/stores/alerts.store';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/ui/sidebar/sidebar.svelte';
	import ProfileDropdown from '$lib/ui/profile-dropdown.svelte';
	import AlertsDropdown from '$lib/ui/alerts-dropdown.svelte';
	import Search from '$lib/ui/sidebar/search.svelte';
	import { initializeWebSocket } from '$lib/ws/ws';
	import { theme } from '$lib/stores/theme.store';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import Dialog from '$lib/ui/dialog.svelte';
	import type { TermsAndConditions } from '@sourcery/common/types/TermsAndConditions.type';
	import type { ActionResult } from '@sveltejs/kit';
	import { marked } from 'marked';

	// Initialize theme as early as possible
	if (typeof window !== 'undefined') {
		theme.initialize();
	}

	export let data = {
		projects: [],
		project: null,
		session: null,
		conversations: [],
		user: null,
		alerts: [],
		origin: '',
		entities: [],
		token: null,
		terms: {
			needsAcceptance: false,
			activeTerms: null
		}
	};

	$: {
		if (data.project?.files) {
			filesStore.set(data.project.files.filter((f) => f.project === data.project?._id));
		}
		if (data.projects) {
			projectsStore.set(data.projects);
		}
		if (data.conversations) {
			conversationsStore.set(data.conversations.filter((c) => c.project_id === data.project?._id));
		}
		if (data.entities) {
			entitiesStore.set(data.entities.filter((e) => e.project_id === data.project?._id));
		}
		if (data.alerts) {
			alertsStore.set(data.alerts);
		}
		if (data.terms.needsAcceptance && data.terms.activeTerms) {
			data.terms.needsAcceptance = true;
			data.terms.activeTerms = data.terms.activeTerms;
		}
	}

	let isMobileMenuOpen = false;
	let isUserMenuOpen = false;
	let isAlertsMenuOpen = false;
	let showTermsDialog = false;
	let showSuccess = false;
	let hasScrolledToBottom = false;
	let termsContainer: HTMLDivElement;

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Close menus when clicking outside
	async function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (isUserMenuOpen && !target.closest('#user-menu-button')) {
			isUserMenuOpen = false;
		}
		if (isAlertsMenuOpen && !target.closest('#alerts-menu-button')) {
			isAlertsMenuOpen = false;
		}
	}

	function handleSidebarClick() {
		isMobileMenuOpen = false;
	}

	onMount(() => {
		return (async () => {
			if (data.user?.user_id && data.token && data.origin) {
				await initializeWebSocket(data.origin, data.token, data.user, data.project);
			}
		})();
	});

	function handleSubmit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();

			if (result.type === 'success') {
				showTermsDialog = false;
				showSuccess = true;
			}
		};
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		checkIfScrolledToBottom(target);
	}

	function checkIfScrolledToBottom(element: HTMLDivElement) {
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5;
		if (isAtBottom) {
			hasScrolledToBottom = true;
		}
	}

	$: if (termsContainer && data.terms.activeTerms) {
		// Check scroll state whenever terms content changes or container is mounted
		checkIfScrolledToBottom(termsContainer);
	}

	$: formattedTermsContent = data.terms.activeTerms ? marked(data.terms.activeTerms.content) : '';

	$: if (data.terms.needsAcceptance && data.terms.activeTerms) {
		showTermsDialog = true;
	}
</script>

{#if showTermsDialog && data.terms.activeTerms}
	<Dialog
		show={true}
		title="Terms & Conditions"
		message="Please review and accept our Terms & Conditions to continue using the service."
		confirmText="Accept"
		cancelText="Decline"
		confirmClass="bg-indigo-600 hover:bg-indigo-500 {!hasScrolledToBottom
			? 'opacity-50 cursor-not-allowed'
			: ''}"
		type="warning"
		on:confirm={async () => {
			if (hasScrolledToBottom) {
				const formData = new FormData();
				const response = await fetch('/terms/accept', {
					method: 'POST',
					body: formData
				});
				if (response.ok) {
					showTermsDialog = false;
					showSuccess = true;
					// Refresh the page to update terms acceptance state
					window.location.reload();
				}
			}
		}}
		on:close={() => {
			// Redirect to logout if user declines
			window.location.href = '/logout';
		}}
	>
		<div class="mt-4 space-y-4">
			<div
				bind:this={termsContainer}
				on:scroll={handleScroll}
				class="prose dark:prose-invert prose-sm max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4"
			>
				{@html formattedTermsContent}
			</div>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Version {data.terms.activeTerms.version}
			</p>
			{#if !hasScrolledToBottom}
				<p class="text-sm text-amber-500 dark:text-amber-400">
					Please scroll to the bottom to accept the terms and conditions
				</p>
			{/if}
		</div>
	</Dialog>
{/if}

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-white dark:bg-gray-900">
	<!-- Mobile menu -->
	{#if isMobileMenuOpen}
		<div
			class="relative z-50 lg:hidden"
			role="dialog"
			aria-modal="true"
			transition:fade={{ duration: 300 }}
		>
			<div class="fixed inset-0 bg-gray-900/80 dark:bg-black/80" aria-hidden="true"></div>
			<div class="fixed inset-0 flex">
				<div
					class="relative mr-16 flex w-full max-w-xs flex-1"
					transition:fly={{ x: -100, duration: 300 }}
				>
					<div class="flex h-full w-full flex-col overflow-y-auto">
						<Sidebar selected_project={data.project} on:menuItemClick={handleSidebarClick} />
					</div>
					<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
						<button type="button" class="-m-2.5 p-2.5" on:click={toggleMobileMenu}>
							<span class="sr-only">Close sidebar</span>
							<svg
								class="size-6 text-gray-600 dark:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
								data-slot="icon"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Desktop sidebar -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
		<div class="flex h-full flex-col overflow-y-auto">
			<Sidebar selected_project={data.project} on:menuItemClick={() => {}} />
		</div>
	</div>

	<!-- Main content -->
	<div class="lg:pl-72">
		<div
			class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
		>
			<!-- Mobile menu button -->
			<button
				type="button"
				class="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
				on:click={toggleMobileMenu}
			>
				<span class="sr-only">Open sidebar</span>
				<svg
					class="size-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>
			</button>

			<!-- Separator -->
			<div class="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true"></div>

			<div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
				<Search project_id={data.project?._id} />

				<div class="flex items-center gap-x-4 lg:gap-x-6">
					<AlertsDropdown bind:isAlertsMenuOpen />

					<!-- Separator -->
					<div
						class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700"
						aria-hidden="true"
					></div>

					<!-- Profile dropdown -->
					<ProfileDropdown user={data.user} bind:isUserMenuOpen />
				</div>
			</div>
		</div>

		<main class="py-10">
			<div class="px-4 sm:px-6 lg:px-8">
				<slot />
			</div>
		</main>
	</div>
</div>

<SuccessAlert bind:show={showSuccess} message="Terms & Conditions accepted successfully" />
