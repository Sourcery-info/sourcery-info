<script lang="ts">
	import type { LoginFormData } from '$lib/types/Forms.type';
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/Sourcery Logo.png';
	import { fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { appVersionStore } from '$lib/i18n/config';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form: LoginFormData;

	let email = data.inviteCode?.email || '';
	let inviteCode = data.inviteCode?.code || '';
	let emailReadOnly = !!data.inviteCode;
	let is_first_user = data.is_first_user;
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
							{#if is_first_user}
								{$_('create_account.tagline_first_user')}
							{:else}
								{$_('create_account.tagline')}
							{/if}
						</p>
						<p class="text-gray-300 leading-relaxed">
							{$_(`create_account.description.${$appVersionStore}`)}
						</p>
						<p class="text-sm text-gray-400 border-l-2 border-indigo-500 pl-4">
							{$_(`create_account.security_note.${$appVersionStore}`)}
						</p>
					</div>
				</div>

				<!-- Right side - Create Account Form -->
				<div class="lg:pl-12">
					<h2 class="text-2xl font-bold leading-9 tracking-tight text-white mb-8">
						{#if is_first_user}
							{$_('create_account.title_first_user')}
						{:else}
							{$_('create_account.title')}
						{/if}
					</h2>

					<form class="space-y-6" method="POST" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="username" class="block text-sm font-medium leading-6 text-white"
									>{$_('create_account.username_label')}</label
								>
								<div class="mt-2">
									<input
										id="username"
										name="username"
										type="text"
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.username}
									<p class="mt-2 text-sm text-red-400">{form.errors.username}</p>
								{/if}
							</div>

							<div>
								<label for="name" class="block text-sm font-medium leading-6 text-white"
									>{$_('create_account.name_label')}</label
								>
								<div class="mt-2">
									<input
										id="name"
										name="name"
										type="text"
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.name}
									<p class="mt-2 text-sm text-red-400">{form.errors.name}</p>
								{/if}
							</div>

							<div>
								<label for="email" class="block text-sm font-medium leading-6 text-white"
									>{$_('create_account.email_label')}</label
								>
								<div class="mt-2">
									<input
										id="email"
										name="email"
										type="email"
										required
										bind:value={email}
										readonly={emailReadOnly}
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6 {emailReadOnly
											? 'opacity-50 cursor-not-allowed'
											: ''}"
									/>
								</div>
								{#if form?.errors?.email}
									<p class="mt-2 text-sm text-red-400">{form.errors.email}</p>
								{/if}
							</div>

							<div>
								<label for="password" class="block text-sm font-medium leading-6 text-white"
									>{$_('create_account.password_label')}</label
								>
								<div class="mt-2">
									<input
										id="password"
										name="password"
										type="password"
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.password}
									<p class="mt-2 text-sm text-red-400">{form.errors.password}</p>
								{/if}
							</div>

							<div>
								<label for="confirmPassword" class="block text-sm font-medium leading-6 text-white"
									>{$_('create_account.confirm_password_label')}</label
								>
								<div class="mt-2">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.confirmPassword}
									<p class="mt-2 text-sm text-red-400">{form.errors.confirmPassword}</p>
								{/if}
							</div>

							{#if !data.inviteCode && !is_first_user}
								<div>
									<label for="inviteCode" class="block text-sm font-medium leading-6 text-white"
										>{$_('create_account.invite_code_label')}</label
									>
									<div class="mt-2">
										<input
											id="inviteCode"
											name="inviteCode"
											type="text"
											bind:value={inviteCode}
											class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
										/>
									</div>
									{#if form?.errors?.inviteCode}
										<p class="mt-2 text-sm text-red-400">{form.errors.inviteCode}</p>
									{/if}
								</div>
							{:else}
								<input type="hidden" name="inviteCode" value={inviteCode} />
							{/if}
						</div>

						<button
							type="submit"
							class="flex w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg hover:from-indigo-400 hover:to-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200 hover:shadow-indigo-500/25"
						>
							{$_('create_account.submit_button')}
						</button>
					</form>

					{#if !is_first_user}
						<p class="mt-8 text-center text-sm text-gray-400">
							{$_('create_account.login.prompt')}
							<a
								href="/login"
								class="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors duration-200"
							>
								{$_('create_account.login.link_text')}
							</a>
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
