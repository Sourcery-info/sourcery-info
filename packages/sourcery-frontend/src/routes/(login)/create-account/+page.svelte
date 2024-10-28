<script lang="ts">
    import type { LoginFormData } from '$lib/types/Forms.type';
    import { enhance } from '$app/forms';
    import { Button, FormGroup, Label, Input, FormText, Row, Col } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';
    export let form: LoginFormData;
</script>
<Row>
    <Col lg={{ size: 6, offset: 3 }}>
        <Cardcontainer>
            <div slot="title"><h2>Create Account</h2></div>
            <form method="POST" use:enhance>
                <FormGroup>
                <Label for="username">Username</Label>
                <Input type="text" name="username" value={form?.data?.username ?? ''} placeholder="Username" required />
                {#if form?.errors?.username}
                    <FormText color="danger">{form.errors.username}</FormText>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="password">Password</Label>
                <Input type="password" name="password" value={form?.data?.password ?? ''} placeholder="Password" required />
                {#if form?.errors?.password}
                    <FormText color="danger">{form.errors.password}</FormText>
                {/if}
            </FormGroup>
            <FormGroup>
                <Label for="confirmPassword">Confirm Password</Label>
                <Input type="password" name="confirmPassword" value={form?.data?.confirmPassword ?? ''} placeholder="Confirm Password" required />
                {#if form?.errors?.confirmPassword}
                    <FormText color="danger">{form.errors.confirmPassword}</FormText>
                {/if}
            </FormGroup>
            <Button type="submit" color="primary" class="mt-3">Create Account</Button>
        </form>
        </Cardcontainer>
        <a href="/login" class="d-block mt-3">Back to Login</a>
    </Col>
</Row>


