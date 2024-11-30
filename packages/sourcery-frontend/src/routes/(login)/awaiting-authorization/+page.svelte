<script>
    /** @type {import('./$types').PageData} */
    
    import logo from '$lib/assets/Sourcery Logo.png';
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src={logo} alt="Sourcery">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">Awaiting Authorization</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <p class="text-center text-gray-400">
            Your account is awaiting authorization. Please wait for an administrator to approve your account.
        </p>
        
        <div class="mt-10 text-center">
            <a href="/logout" class="font-semibold text-indigo-400 hover:text-indigo-300">
                Log out of this account
            </a>
        </div>
    </div>
</div>