<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import { Button, Container, Row, Col, Card, CardBody } from '@sveltestrap/sveltestrap';
</script>

<Container class="mt-4">
    <Row>
        <Col>
            <Container>
                <Row>
                    {#each data.projects as project}
                        <Col xs="4">
                            <Card class="mb-3">
                                <CardBody>
                                    <h4>{project.name}</h4>
                                    {#if project.description}
                                        <p>{project.description}</p>
                                    {/if}
                                    {#if project.created_at}
                                        <p>{project.created_at}</p>
                                    {/if}
                                    <p>
                                        <Button color="primary" href="/chat/{project._id}">Chat</Button>
                                        <Button color="secondary" href="/files/{project._id}">Files</Button>
                                        <Button color="secondary" href="/projects/edit/{project._id}">Edit</Button>
                                    </p>
                                </CardBody>
                            </Card>
                        </Col>
                    {/each}
                </Row>
            </Container>
        </Col>
    </Row>
</Container>