<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="bg-gray-900 py-10">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:max-w-none">
            <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                <a href="/projects/new" class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-800/30 p-6 ring-1 ring-white/10 hover:bg-gray-800/50">
                    <div class="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h3 class="mt-4 text-lg font-semibold leading-6 text-white">New Project</h3>
                    <p class="mt-2 text-sm text-gray-300">Create a new project</p>
                </a>

                {#each data.projects as project}
                    <div class="group relative rounded-lg bg-gray-800/50 p-6 ring-1 ring-white/10 hover:bg-gray-800/70">
                        <div>
                            <h3 class="text-lg font-semibold leading-6 text-white">
                                {project.name}
                            </h3>
                            {#if project.description}
                                <p class="mt-2 text-sm text-gray-300">
                                    {project.description}
                                </p>
                            {/if}
                            {#if project.created_at}
                                <p class="mt-4 text-sm text-gray-500">
                                    Created {project.created_at}
                                </p>
                            {/if}
                        </div>
                        <div class="mt-6 flex gap-3">
                            <a
                                href="/chat/{project._id}"
                                class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Chat
                            </a>
                            <a
                                href="/files/{project._id}"
                                class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                            >
                                Files
                            </a>
                            <a
                                href="/projects/edit/{project._id}"
                                class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                            >
                                Edit
                            </a>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>