<script lang="ts">
    import { Input, Container, Row, Col, InputGroup, Button } from '@sveltestrap/sveltestrap';
    export let data;

    type Messages = {
        type: 'input' | 'response';
        content: string;
    };

    let content = '';
    let input = '';
    let thinking = false;
    let messages: Messages[] = [];

    /**
     * Handles the form submission event.
     *
     * @param {SubmitEvent} event - The form submission event.
     */
    async function handleSubmit(event: SubmitEvent) {
        if (input === '') return;
        event.preventDefault();
        const query = input;
        input = '';
        thinking = true;
        messages.push({ type: 'input', content: query });
        messages = messages;
        const response = await fetch(`/chat/${data.project?._id}/${data.conversation_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: query })
        });
        try {
            const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
            if (!reader) throw new Error('No reader');
            while (true) {
                const { done, value } = await reader.read();
                thinking = false;
                if (done) {
                    messages.push({ type: 'response', content });
                    content = '';
                    break;
                }
                content += value.replace(/\n/g, '<br>');
            }
        } catch (error) {
            console.error('Error reading response', error);
        } finally {
            thinking = false;
            messages = messages;
            document.getElementById('input')?.focus();
        }
    }
</script>

<div class="chat-window">
    <Col sm="12" class="answer">
        {#each messages as message}
            {#if message.type === 'input'}
                <p class="text-right">&gt; {message.content}</p>
            {/if}
            {#if message.type === 'response'}
                <p>{@html message.content}</p>
            {/if}
        {/each}
        {#if thinking}
            <p>Thinking...</p>
        {/if}
        {@html content}
    </Col>
    <div class="d-flex question">
        <Col sm="12">
            <form class="bottom" method="POST" on:submit|preventDefault={handleSubmit} action="?/chat">
                <InputGroup>
                    <Input
                        id="input"
                        type="text"
                        placeholder="Type a message"
                        bind:value={input}
                        disabled={thinking}
                    />
                    {#if !thinking}
                        <Button color="primary">Send</Button>
                    {:else}
                        <Button color="warning">Cancel</Button>
                    {/if}
                </InputGroup>
            </form>
        </Col>
    </div>
</div>

<style lang="scss">
    $chat-bg: #d1d7fc;

    .chat-window {
        padding: 20px;
        display: grid;
        grid-template-rows: auto 70px; // Larger input area
        gap: 20px; // Add some spacing
        height: 100%;

    .answer {
        padding: 20px;
        background-color: $chat-bg;
        border-radius: 8px;
        font-family: 'SF Mono', 'Fira Code', monospace; // Better code font
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        line-height: 1.6;
    }

    .question {
        margin-top: 0;
        padding: 15px;
        background-color: $chat-bg;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
}
</style>