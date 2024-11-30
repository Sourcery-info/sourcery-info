<script>
    export let form;
    export let name = "";
    export let tags = "";
    export let description = "";
    export let notes = "";
    export let is_public = false;
</script>

<div class="space-y-6">
    <div>
        <label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>
        <div class="mt-2">
            <input 
                type="text" 
                name="name" 
                id="name"
                bind:value={name}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form?.errors?.name ? 'outline-red-500' : ''}"
            />
        </div>
        {#if form?.errors?.name}
            <p class="mt-2 text-sm text-red-500">{form.errors.name}</p>
        {/if}
    </div>

    <div class="flex gap-3">
        <div class="flex h-6 shrink-0 items-center">
            <div class="group grid size-4 grid-cols-1">
                <input 
                    type="checkbox" 
                    id="is_public"
                    name="is_public"
                    bind:value={is_public}
                    class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                />
                <svg class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white" viewBox="0 0 14 14" fill="none">
                    <path class="opacity-0 group-has-[:checked]:opacity-100" d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
        <div class="text-sm/6">
            <label for="is_public" class="font-medium text-white">Public Project</label>
        </div>
    </div>

    <div>
        <label for="tags" class="block text-sm font-medium leading-6 text-white">Tags</label>
        <div class="mt-2">
            <input 
                type="text" 
                name="tags" 
                id="tags"
                bind:value={tags}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form?.errors?.tags ? 'outline-red-500' : ''}"
            />
        </div>
        {#if form?.errors?.tags}
            <p class="mt-2 text-sm text-red-500">{form.errors.tags}</p>
        {/if}
    </div>

    <div>
        <label for="description" class="block text-sm font-medium leading-6 text-white">Description</label>
        <div class="mt-2">
            <textarea 
                name="description" 
                id="description"
                rows="3"
                bind:value={description}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form?.errors?.description ? 'outline-red-500' : ''}"
            ></textarea>
        </div>
        {#if form?.errors?.description}
            <p class="mt-2 text-sm text-red-500">{form.errors.description}</p>
        {/if}
    </div>

    <div>
        <label for="notes" class="block text-sm font-medium leading-6 text-white">Notes</label>
        <div class="mt-2">
            <textarea 
                name="notes" 
                id="notes"
                rows="3"
                bind:value={notes}
                class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 {form?.errors?.notes ? 'outline-red-500' : ''}"
            ></textarea>
        </div>
        {#if form?.errors?.notes}
            <p class="mt-2 text-sm text-red-500">{form.errors.notes}</p>
        {/if}
    </div>
</div>