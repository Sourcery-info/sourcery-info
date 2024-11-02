<script>
    // @ts-nocheck
    /** @type {import('./$types').PageData} */
    import { Button } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';
    import Projectsettings from '$lib/ui/projectsettings.svelte';
    import ModelSettings from '$lib/ui/modelsettings.svelte';
    import { enhance } from '$app/forms'

    export let form;

    import models from '$lib/models.json';
    let chat_model = models.filter(model => model.type === "chat")[0].value;
    let vector_model = models.filter(model => model.type === "embed")[0].value;
    let temperature = 0.1;
    let security = 'secure';

</script>

<Cardcontainer>
    <div slot="title">
        <h1>New Project</h1>
    </div>

    <form method="POST" use:enhance>
        <Projectsettings bind:form={form} />
        <ModelSettings bind:form={form} {chat_model} {vector_model} {temperature} {security} />
        <Button color="primary" type="submit">Submit</Button>
    </form>
</Cardcontainer>