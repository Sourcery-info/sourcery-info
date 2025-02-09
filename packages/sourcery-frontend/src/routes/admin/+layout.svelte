<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { alertsStore } from '$lib/stores/alerts.store';
	import { usersStore } from '$lib/stores/users.store';
	import { onMount } from 'svelte';
	import AdminSidebar from '$lib/ui/sidebar/admin-sidebar.svelte';
	import ProfileDropdown from '$lib/ui/profile-dropdown.svelte';
	import AlertsDropdown from '$lib/ui/alerts-dropdown.svelte';
	import { initializeWebSocket } from '$lib/ws/ws';

	export let data = {
		session: null,
		user: null,
		alerts: [],
		users: [],
		origin: '',
		token: null
	};

	$: {
		if (data.alerts) {
			alertsStore.set(data.alerts);
		}
		if (data.users) {
			usersStore.set(data.users);
		}
	}

	let isMobileMenuOpen = false;
	let isUserMenuOpen = false;
	let isAlertsMenuOpen = false;

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

	onMount(() => {
		return (async () => {
			if (data.user && data.token && data.origin) {
				await initializeWebSocket(data.origin, data.token, data.user);
			}
		})();
	});
</script>

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
			<div class="fixed inset-0 bg-gray-100/80 dark:bg-gray-900/80" aria-hidden="true"></div>
			<div class="fixed inset-0 flex">
				<div
					class="relative mr-16 flex w-full max-w-xs flex-1"
					transition:fly={{ x: -100, duration: 300 }}
				>
					<div class="flex h-full w-full flex-col overflow-y-auto">
						<AdminSidebar />
					</div>
					<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
						<button type="button" class="-m-2.5 p-2.5" on:click={toggleMobileMenu}>
							<span class="sr-only">Close sidebar</span>
							<svg
								class="size-6 text-black dark:text-white"
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
			<AdminSidebar />
		</div>
	</div>

	<!-- Main content -->
	<div class="lg:pl-72">
		<div
			class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
		>
			<!-- Mobile menu button -->
			<button
				type="button"
				class="-m-2.5 p-2.5 text-black dark:text-white lg:hidden"
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
			<div class="flex flex-grow gap-x-4 self-stretch lg:gap-x-6"></div>
			<!-- Separator -->
			<div class="h-6 w-px bg-gray-100/10 dark:bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

			<div class="flex flex-shrink gap-x-4 self-stretch lg:gap-x-6">
				<div class="flex items-center gap-x-4 lg:gap-x-6">
					<AlertsDropdown bind:isAlertsMenuOpen />
					<!-- Separator -->
					<div
						class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-100/10 dark:lg:bg-gray-900/10"
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
