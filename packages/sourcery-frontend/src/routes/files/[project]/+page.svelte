<script>
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { onMount, onDestroy } from 'svelte';
	import { connect, subscribe, unsubscribe } from '@sourcery/ws/src/client';
	import { Row, Col, Input, Button, Badge } from '@sveltestrap/sveltestrap';
	import { enhance } from '$app/forms';
	export let data;

	/**
	 * Checks all files.
	 *
	 * @param {Event} e - The event object.
	 */
	function checkAllFiles(e) {
		for (let file of data.props.manifest) {
			// @ts-ignore
			file.checked = e.target?.checked;
		}
		data.props.manifest = data.props.manifest;
	}

	onMount(async () => {
		console.log('mounted');
		await connect(data.props.websocket_port);
		try {
			await subscribe(`${data.props.project}-file`, (msg) => {
				const f = data.props.manifest.find((file) => file.uid === msg.file.uid);
				if (f) {
					Object.assign(f, msg.file);
					data.props.manifest = data.props.manifest;
				}
			});
		} catch (error) {
			console.error(error);
		}
	});

	onDestroy(() => {
		try {
			console.log('destroyed');
			unsubscribe('files');
		} catch (error) {
			console.error(error);
		}
	});
</script>

<div style="padding: 10px">
	<Row>
		<Col sm="6">
			<div class="file-upload mb-3 card">
				<div class="card-header">Upload Files</div>
				<div class="card-body">
					<form method="POST" use:enhance enctype="multipart/form-data">
						<Input multiple={true} type="file" name="files" id="files" label="File" required />
						<Button class="mt-2" color="primary" type="submit" formaction="?/upload">Submit</Button>
					</form>
				</div>
			</div>
			<form method="POST" use:enhance>
				<div class="uploaded-files card">
					<div class="card-header file-header">
						<input type="checkbox" on:click={checkAllFiles} />
						<div>Files ({data.props.manifest.length} files)</div>
						<div>
							<Button color="primary" size="sm" formaction="?/reindexFiles">Reindex</Button>
							<Button color="danger" size="sm" formaction="?/deleteFiles">Delete</Button>
						</div>
					</div>
					<ul class="list-group list-group-flush">
						{#each data.props.manifest as file}
							<li class="list-group-item">
								<Input
									name="files"
									value={file.uid}
									type="checkbox"
									label={file.original_name}
									bind:checked={file.checked}
								/>
								<Badge>{file.stage}</Badge>
							</li>
						{/each}
					</ul>
				</div>
			</form>
		</Col>
		<Col sm="6">
			<div class="card">
				<div class="card-header">Database</div>
				<div class="card-body">
					{#if data.props.db_info?.status === 'green'}
						<Badge color="success">Green</Badge>
					{:else if data.props.db_info?.status === 'yellow'}
						<Badge color="warning">Yellow</Badge>
					{:else if data.props.db_info?.status === 'red'}
						<Badge color="danger">Red</Badge>
					{:else}
						<Badge color="secondary">Unknown</Badge>
					{/if}
					<ul class="mt-4">
						<li>Vectors: {data.props.db_info?.vectors_count}</li>
						<li>Indexed Vectors: {data.props.db_info?.indexed_vectors_count}</li>
						<li>Points: {data.props.db_info?.points_count}</li>
						<li>Segments: {data.props.db_info?.segments_count}</li>
					</ul>
				</div>
				<div class="card-footer">
					<form method="POST" use:enhance>
						<Button color="danger" formaction="?/deleteCollection">Delete Collection</Button>
					</form>
				</div>
			</div>
		</Col>
	</Row>
</div>

<style>
	.file-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
