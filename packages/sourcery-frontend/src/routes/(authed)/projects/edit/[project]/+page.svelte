<script>
    
    import { Button, FormGroup, Label, Input, FormText } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';
    import Projectsettings from '$lib/ui/projectsettings.svelte';
    import ModelSettings from '$lib/ui/modelsettings.svelte';
    import { enhance } from '$app/forms'
    
    export let form;
    export let data;

</script>

<Cardcontainer>
    <div slot="title"><h1>Edit Project</h1></div>

    {#if data.project}
        <form method="POST" use:enhance>
            <Projectsettings bind:form={form} bind:name={data.project.name} bind:tags={data.project.tags} bind:description={data.project.description} bind:notes={data.project.notes} />
            <ModelSettings bind:form={form} bind:chat_model={data.project.chat_model} bind:vector_model={data.project.vector_model} bind:temperature={data.project.temperature} bind:security={data.project.security} />
            <Button color="primary">Submit</Button>
        </form>
    {/if}
</Cardcontainer>