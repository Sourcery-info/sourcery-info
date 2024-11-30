<script>
    // @ts-nocheck
    import { FormGroup, Label, Input, FormText } from '@sveltestrap/sveltestrap';
    import models from '$lib/models.json';
    
    export let form;

    export let chat_model;
    export let vector_model;
    export let temperature;
    export let security;
    
    const chatModels = models.filter(model => model.type === 'chat');
    const vectorModels = models.filter(model => model.type === 'embed');
    const temperatureStep = 0.1;
    const temperatureMin = 0;
    const temperatureMax = 1.0;
</script>

<div class="space-y-6">
    <div class="sm:col-span-4">
        <label for="chat_model" class="block text-sm/6 font-medium text-white">Chat Model</label>
        <div class="mt-2 grid grid-cols-1">
            <select 
                name="chat_model" 
                id="chat_model"
                bind:value={chat_model}
                class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            >
                {#each chatModels as model}
                    <option value={model.value}>{model.name}</option>
                {/each}
            </select>
            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
        </div>
        {#if (form?.errors?.chat_model)}
            <p class="mt-2 text-sm text-red-500">{form.errors.chat_model}</p>
        {/if}
    </div>

    <div class="sm:col-span-4">
        <label for="vector_model" class="block text-sm/6 font-medium text-white">Vector Model</label>
        <div class="mt-2 grid grid-cols-1">
            <select 
                name="vector_model" 
                id="vector_model"
                bind:value={vector_model}
                class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pl-3 pr-8 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            >
                {#each vectorModels as model}
                    <option value={model.value}>{model.name}</option>
                {/each}
            </select>
            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
        </div>
        {#if (form?.errors?.vector_model)}
            <p class="mt-2 text-sm text-red-500">{form.errors.vector_model}</p>
        {/if}
    </div>

    <div class="space-y-6">
        <fieldset>
            <legend class="text-sm/6 font-semibold text-white">Security</legend>
            <div class="mt-4 space-y-4">
                <div class="flex items-center gap-x-3">
                    <input 
                        id="security-secure" 
                        name="security" 
                        type="radio" 
                        bind:group={security} 
                        value="secure"
                        class="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
                    >
                    <label for="security-secure" class="block text-sm/6 font-medium text-white">Secure</label>
                </div>
                <div class="flex items-center gap-x-3">
                    <input 
                        id="security-insecure" 
                        name="security" 
                        type="radio" 
                        bind:group={security} 
                        value="insecure"
                        class="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 [&:not(:checked)]:before:hidden"
                    >
                    <label for="security-insecure" class="block text-sm/6 font-medium text-white">Insecure - Internet access</label>
                </div>
            </div>
            {#if (form?.errors?.security)}
                <p class="mt-2 text-sm text-red-500">{form.errors.security}</p>
            {/if}
        </fieldset>
    </div>

    <div class="sm:col-span-4">
        <label for="temperature" class="block text-sm/6 font-medium text-white">Temperature: {temperature}</label>
        <div class="mt-2">
            <input 
                type="range" 
                name="temperature" 
                id="temperature"
                bind:value={temperature} 
                step={temperatureStep} 
                min={temperatureMin} 
                max={temperatureMax}
                class="w-full appearance-none bg-white/5 rounded-lg h-2 accent-indigo-500"
            >
        </div>
        {#if (form?.errors?.temperature)}
            <p class="mt-2 text-sm text-red-500">{form.errors.temperature}</p>
        {/if}
    </div>
</div>