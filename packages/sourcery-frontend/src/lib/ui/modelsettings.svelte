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

<FormGroup>
    <Label for="chat_model">Chat Model</Label>
    <Input type="select" name="chat_model" bind:value={chat_model}>
        {#each chatModels as model}
            <option value={model.value}>{model.name}</option>
        {/each}
    </Input>
    {#if (form?.errors?.chat_model)}
        <FormText color="danger">{form.errors.chat_model}</FormText>
    {/if}
</FormGroup>
<FormGroup>
    <Label for="vector_model">Vector Model</Label>
    <Input type="select" name="vector_model" bind:value={vector_model}>
        {#each vectorModels as model}
            <option value={model.value}>{model.name}</option>
        {/each}
    </Input>
    {#if (form?.errors?.vector_model)}
        <FormText color="danger">{form.errors.vector_model}</FormText>
    {/if}
</FormGroup>
<FormGroup>
    <label for="security">Security</label>
    <FormGroup check>
        <Input name="security" type="radio" theme="light" bind:group={security} value="secure" label="Secure" />
        <Input name="security" type="radio" theme="light" bind:group={security} value="insecure" label="Insecure - Internet access" />
        {#if (form?.errors?.security)}
            <FormText color="danger">{form.errors.security}</FormText>
        {/if}
    </FormGroup>
</FormGroup>
<FormGroup>
    <Label for="temperature">Temperature: {temperature}</Label>
    <Input type="range" name="temperature" bind:value={temperature} step={temperatureStep} min={temperatureMin} max={temperatureMax} />
    {#if (form?.errors?.temperature)}
        <FormText color="danger">{form.errors.temperature}</FormText>
    {/if}
</FormGroup>