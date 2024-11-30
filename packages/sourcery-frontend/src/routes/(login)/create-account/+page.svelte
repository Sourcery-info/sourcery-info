<script lang="ts">
    import type { LoginFormData } from '$lib/types/Forms.type';
    import { enhance } from '$app/forms';
    import logo from '$lib/assets/Sourcery Logo.png';
    export let form: LoginFormData;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src={logo} alt="Sourcery">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">Create your account</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" method="POST" use:enhance>
            <div>
                <label for="username" class="block text-sm font-medium leading-6 text-white">Username</label>
                <div class="mt-2">
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={form?.data?.username ?? ''}
                        required
                        class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>
                {#if form?.errors?.username}
                    <p class="mt-2 text-sm text-red-500">{form.errors.username}</p>
                {/if}
            </div>

            <div>
                <label for="password" class="block text-sm font-medium leading-6 text-white">Password</label>
                <div class="mt-2">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form?.data?.password ?? ''}
                        required
                        class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>
                {#if form?.errors?.password}
                    <p class="mt-2 text-sm text-red-500">{form.errors.password}</p>
                {/if}
            </div>

            <div>
                <label for="confirmPassword" class="block text-sm font-medium leading-6 text-white">Confirm Password</label>
                <div class="mt-2">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form?.data?.confirmPassword ?? ''}
                        required
                        class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>
                {#if form?.errors?.confirmPassword}
                    <p class="mt-2 text-sm text-red-500">{form.errors.confirmPassword}</p>
                {/if}
            </div>

            <div>
                <button
                    type="submit"
                    class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                    Create Account
                </button>
            </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-400">
            Already have an account?
            <a href="/login" class="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</a>
        </p>
    </div>
</div>


