<script lang="ts">
	import type { LoginFormData } from '$lib/types/Forms.type';
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/Sourcery Logo.png';
	import { fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { appVersionStore } from '$lib/i18n/config';
	import { goto } from '$app/navigation';

	export let form: LoginFormData;

	$: if (form?.state === '2fa_required') {
		goto(`/2fa-login/verify?userId=${form.userId}`);
	}
</script>

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
							{$_('login.tagline')}
						</p>
						<p class="text-gray-300 leading-relaxed">
							{$_(`login.description.${$appVersionStore}`)}
						</p>
						<p class="text-sm text-gray-400 border-l-2 border-indigo-500 pl-4">
							{$_(`login.security_note.${$appVersionStore}`)}
						</p>
					</div>
				</div>

				<!-- Right side - Login Form -->
				<div class="lg:pl-12">
					<h2 class="text-2xl font-bold leading-9 tracking-tight text-white mb-8">
						{$_('login.title')}
					</h2>

					<form class="space-y-6" method="POST" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="username" class="block text-sm font-medium leading-6 text-white"
									>{$_('login.username_label')}</label
								>
								<div class="mt-2">
									<input
										id="username"
										name="username"
										type="text"
										value={form?.data?.username || ''}
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div>
								<div class="flex items-center justify-between">
									<label for="password" class="block text-sm font-medium leading-6 text-white"
										>{$_('login.password_label')}</label
									>
								</div>
								<div class="mt-2">
									<input
										id="password"
										name="password"
										type="password"
										value={form?.data?.password || ''}
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
						</div>

						{#if form?.state === 'error'}
							<div
								class="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2 border border-red-500/20"
							>
								{form.message}
							</div>
						{/if}

						<button
							type="submit"
							class="flex w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg hover:from-indigo-400 hover:to-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200 hover:shadow-indigo-500/25"
						>
							{$_('login.submit_button')}
						</button>
					</form>

					<p class="mt-8 text-center text-sm text-gray-400">
						{$_('login.create_account.prompt')}
						<a
							href="/create-account"
							class="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors duration-200"
						>
							{$_('login.create_account.link_text')}
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
