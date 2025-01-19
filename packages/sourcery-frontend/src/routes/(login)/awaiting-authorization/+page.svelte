<script lang="ts">
	/** @type {import('./$types').PageData} */
	import logo from '$lib/assets/Sourcery Logo.png';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { appVersionStore } from '$lib/i18n/config';
	import VersionSwitcher from '$lib/ui/version-switcher.svelte';

	onMount(async () => {
		checkState();
		setInterval(checkState, 10000);
	});

	async function checkState() {
		const response = await fetch('/state');
		const data = await response.json();
		console.log(data);
		if (data.user?.approved) {
			window.location.href = '/';
		}
	}
</script>

<VersionSwitcher />

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center px-6 py-12"
>
	<div class="w-full max-w-4xl" in:fade={{ duration: 300 }}>
		<div class="backdrop-blur-sm bg-black/30 rounded-3xl p-8 shadow-2xl border border-white/10">
			<div class="grid lg:grid-cols-2 gap-12">
				<!-- Left side - Branding -->
				<div class="space-y-6 lg:border-r lg:border-white/10 lg:pr-12">
					<img
						class="mx-auto h-32 w-auto hover:scale-105 transition-transform duration-300"
						src={logo}
						alt="Sourcery"
					/>
					<div class="space-y-4">
						<p
							class="text-2xl text-indigo-400 font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
						>
							{$_('awaiting_authorization.tagline')}
						</p>
						<p class="text-gray-300 leading-relaxed">
							{$_(`awaiting_authorization.description.${$appVersionStore}`)}
						</p>
						<p class="text-sm text-gray-400 border-l-2 border-indigo-500 pl-4">
							{$_(`awaiting_authorization.security_note.${$appVersionStore}`)}
						</p>
					</div>
				</div>

				<!-- Right side - Awaiting Authorization -->
				<div class="lg:pl-12 flex flex-col items-center justify-center">
					<div class="text-center space-y-6">
						<!-- Loading Animation -->
						<div class="flex justify-center mb-8">
							<div class="relative">
								<div class="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
								<div
									class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0"
								></div>
							</div>
						</div>

						<h2 class="text-2xl font-bold leading-9 tracking-tight text-white">
							{$_('awaiting_authorization.title')}
						</h2>

						<div class="max-w-sm">
							<p class="text-gray-300 leading-relaxed">
								{$_('awaiting_authorization.status_message')}
							</p>
						</div>

						<div class="pt-6">
							<a
								href="/logout"
								class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors duration-200"
							>
								{$_('awaiting_authorization.logout_button')}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
