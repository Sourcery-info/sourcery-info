<script>
    // @ts-nocheck
    /** @type {import('./$types').PageData} */
    import { Button } from '@sveltestrap/sveltestrap';
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

<div>
    <div class="text-base/7 font-semibold text-white">New Project</div>
    <div class="mt-10">
        <form method="POST" use:enhance>
            <Projectsettings bind:form={form} />
        <ModelSettings bind:form={form} {chat_model} {vector_model} {temperature} {security} />
            <Button color="primary" type="submit">Submit</Button>
        </form>
    </div>
</div>