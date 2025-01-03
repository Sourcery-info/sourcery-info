<script lang="ts">
	import type { LoginFormData } from '$lib/types/Forms.type';
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/Sourcery Logo.png';
	import { fade } from 'svelte/transition';
	export let form: LoginFormData;
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
							Join the future of document analysis
						</p>
						<p class="text-gray-300 leading-relaxed">
							Sourcery empowers journalists to unlock insights and tell compelling stories. Explore
							your document cache using natural language, all within a secure environment - perfect
							for investigative journalism and sensitive research.
						</p>
						<p class="text-sm text-gray-400 border-l-2 border-indigo-500 pl-4">
							Powered by local AI processing for unprecedented security. No data ever leaves your
							system.
						</p>
					</div>
				</div>

				<!-- Right side - Create Account Form -->
				<div class="lg:pl-12">
					<h2 class="text-2xl font-bold leading-9 tracking-tight text-white mb-8">
						Create your account
					</h2>

					<form class="space-y-6" method="POST" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="username" class="block text-sm font-medium leading-6 text-white"
									>Username</label
								>
								<div class="mt-2">
									<input
										id="username"
										name="username"
										type="text"
										value={form?.data?.username ?? ''}
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
									>Full Name</label
								>
								<div class="mt-2">
									<input
										id="name"
										name="name"
										type="text"
										value={form?.data?.name ?? ''}
										required
										placeholder="John Smith"
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.name}
									<p class="mt-2 text-sm text-red-400">{form.errors.name}</p>
								{/if}
							</div>

							<div>
								<label for="email" class="block text-sm font-medium leading-6 text-white"
									>Email</label
								>
								<div class="mt-2">
									<input
										id="email"
										name="email"
										type="email"
										value={form?.data?.email ?? ''}
										required
										placeholder="you@example.com"
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.email}
									<p class="mt-2 text-sm text-red-400">{form.errors.email}</p>
								{/if}
							</div>

							<div>
								<label for="password" class="block text-sm font-medium leading-6 text-white"
									>Password</label
								>
								<div class="mt-2">
									<input
										id="password"
										name="password"
										type="password"
										value={form?.data?.password ?? ''}
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
									>Confirm Password</label
								>
								<div class="mt-2">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										value={form?.data?.confirmPassword ?? ''}
										required
										class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
									/>
								</div>
								{#if form?.errors?.confirmPassword}
									<p class="mt-2 text-sm text-red-400">{form.errors.confirmPassword}</p>
								{/if}
							</div>
						</div>

						<button
							type="submit"
							class="flex w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg hover:from-indigo-400 hover:to-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200 hover:shadow-indigo-500/25"
						>
							Create Account
						</button>
					</form>

					<p class="mt-8 text-center text-sm text-gray-400">
						Already have an account?
						<a
							href="/login"
							class="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors duration-200"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
