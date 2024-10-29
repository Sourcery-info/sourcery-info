<script>
    /** @type {import('./$types').PageData} */
    import { Row, Col } from '@sveltestrap/sveltestrap';
    import Cardcontainer from '$lib/ui/cardcontainer.svelte';
    export let data;
</script>

<Row>
    <Col lg={{ size: 6, offset: 3 }}>
        <Cardcontainer>
            <div slot="title"><h2>Awaiting Authorization</h2></div>
            <p>Your account is awaiting authorization. Please wait for an administrator to approve your account.</p>
        </Cardcontainer>
        <a href="/logout" class="d-block mt-3">Log out of this account</a>
    </Col>
</Row>