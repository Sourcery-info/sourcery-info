<script>
    
    import { Button, FormGroup, Label, Input, FormText } from '@sveltestrap/sveltestrap';
    import Projectsettings from '$lib/ui/projectsettings.svelte';
    import ModelSettings from '$lib/ui/modelsettings.svelte';
    import { enhance } from '$app/forms'
    
    export let form;
    export let data;

</script>

<div>
    <div class="text-base/7 font-semibold text-white">Edit Project Settings</div>
    <div class="text-sm/6 text-gray-400">Note that if you change the vector model, you will need to re-index your documents.</div>

    <div class="mt-10">
    {#if data.project}
        <form method="POST" use:enhance>
            <Projectsettings bind:form={form} bind:name={data.project.name} bind:tags={data.project.tags} bind:description={data.project.description} bind:notes={data.project.notes} />
            <ModelSettings bind:form={form} bind:chat_model={data.project.chat_model} bind:vector_model={data.project.vector_model} bind:temperature={data.project.temperature} bind:security={data.project.security} />
            <Button color="primary">Submit</Button>
        </form>
        {/if}
    </div>
</div>
