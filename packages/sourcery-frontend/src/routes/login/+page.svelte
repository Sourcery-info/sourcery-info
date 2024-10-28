<script lang="ts">
    import type { LoginFormData } from '$lib/types/Forms.type';
    import { enhance } from '$app/forms';
    import { Button, FormGroup, Label, Input, FormText } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';

    export let form: LoginFormData;
</script>

<Cardcontainer>
    <div slot="title"><h2>Login</h2></div>
    <form method="POST" use:enhance>
        <FormGroup>
            <Label for="username">Username</Label>
            <Input type="text" name="username" value={form?.data?.username} placeholder="Username" required />
        </FormGroup>
        <FormGroup>
            <Label for="password">Password</Label>
            <Input type="password" name="password" value={form?.data?.password} placeholder="Password" required />
        </FormGroup>
        {#if form?.state === "error"}
            <div class="mt-3 mb-3">
                <FormText color="danger">{form.message}</FormText>
            </div>
        {/if}
        <Button type="submit">Login</Button>
    </form>
</Cardcontainer>
<div class="mt-3">
    <a href="/create-account">Create Account</a>
</div>
