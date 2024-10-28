<script>
    // @ts-nocheck
    import { Button } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';
    import ModelSettings from '$lib/ui/modelsettings.svelte';
    import { enhance } from '$app/forms'
    
    export let form;
    export let data;

</script>
<Cardcontainer>
    <div slot="title">
        <h1>Default Settings</h1>
        <p>These settings will be applied by default to new projects. They will not affect the settings of existing projects.</p>
    </div>
    <form method="POST" use:enhance>
        <ModelSettings bind:form={form} bind:chat_model={data.props.settings.chat_model} bind:vector_model={data.props.settings.vector_model} bind:temperature={data.props.settings.temperature} bind:security={data.props.settings.security} />
        <Button color="primary" type="submit">Submit</Button>
    </form>
</Cardcontainer>