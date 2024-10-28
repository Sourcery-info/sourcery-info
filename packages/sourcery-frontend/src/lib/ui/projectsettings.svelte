<script>
    import { FormGroup, Label, Input, FormText, FormCheck } from '@sveltestrap/sveltestrap';
    
    export let form;

    export let name = "";
    export let tags = "";
    export let description = "";
    export let notes = "";
    export let is_public = false;
</script>

<FormGroup>
    <Label for="name">Name</Label>
    <Input type="text" name="name" label="Name" bind:value={name} invalid={(form?.errors?.name)} />
    {#if (form?.errors?.name)}
        <FormText color="danger">{form.errors.name}</FormText>
    {/if}
</FormGroup>
<FormGroup>
    <FormCheck type="checkbox" name="is_public" bind:value={is_public} label="Public Project" />
</FormGroup>
<FormGroup>
    <Label for="tags">Tags</Label>
    <Input type="text" name="tags" bind:value={tags} invalid={(form?.errors?.tags)} />
    {#if (form?.errors?.tags)}
        <FormText color="danger">{form.errors.tags}</FormText>
    {/if}
</FormGroup>
<FormGroup>
    <Label for="description">Description</Label>
    <Input type="textarea" name="description" bind:value={description} invalid={(form?.errors?.description)} />
    {#if (form?.errors?.description)}
        <FormText color="danger">{form.errors.description}</FormText>
    {/if}
</FormGroup>
<FormGroup>
    <Label for="notes">Notes</Label>
    <Input type="textarea" name="notes" bind:value={notes} invalid={(form?.errors?.notes)} />
    {#if (form?.errors?.notes)}
        <FormText color="danger">{form.errors.notes}</FormText>
    {/if}
</FormGroup>