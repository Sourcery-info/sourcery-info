<script lang="ts">
    /** @type {import('./$types').PageData} */
    
    import { Table, Button, Label, FormGroup, Input, FormCheck, FormText, Alert } from '@sveltestrap/sveltestrap';

    import { enhance } from '$app/forms'

    export let form: { 
        message?: string;
        errors?: { [key: string]: string } 
    } | null;

    export let data;
</script>

<h1>Edit User</h1>

<form use:enhance method="POST">
    {#if form?.message}
        <Alert color="danger">{form.message}</Alert>
    {/if}
    <FormGroup>
        <Label for="username">Username</Label>
        <Input name="username" value={data.user?.username} />
        {#if form?.errors?.username}
            <FormText color="danger">{form.errors.username}</FormText>
        {/if}
    </FormGroup>
    <FormGroup>
        <FormCheck name="approved" value={1} checked={data.user?.approved} label="Approved" />
        {#if form?.errors?.approved}
            <FormText color="danger">{form.errors.approved}</FormText>
        {/if}
    </FormGroup>
    <FormGroup>
        <FormCheck name="admin" value={1} label="Admin" checked={data.user?.admin} />
        {#if form?.errors?.admin}
            <FormText color="danger">{form.errors.admin}</FormText>
        {/if}
    </FormGroup>
    <Button type="submit">Save</Button>
    <Button type="button" color="danger" href="/admin/users/list">Cancel</Button>
</form>