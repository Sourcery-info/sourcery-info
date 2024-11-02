<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { Nav, NavItem, NavLink, Icon, Button } from '@sveltestrap/sveltestrap';
	export let selected_project;
	import { enhance } from '$app/forms';

	async function toggleActive(file) {
		file.status = file.status == 'active' ? 'inactive' : 'active';
		selected_project = selected_project;
		const res = await fetch(`/files/${selected_project.urlid}?/update`, {
			method: 'POST',
			body: JSON.stringify(file)
		});
	}
</script>

<div class="sidebar">
	<Nav vertical>
		<NavItem>
			<NavLink href="/">
				<Icon name="boxes" />
				Projects
			</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/projects/new">
				<Icon name="plus-circle" />
				New Project
			</NavLink>
		</NavItem>
		<hr />

		{#if selected_project}
			<Nav vertical style="padding-left: 10px">
				<NavItem>
					<div class="bold"><Icon name="folder" /> Files</div>
					{#each selected_project.files as file}
						<div class="sidebar-item">
							<form method="POST" use:enhance action="/files/{selected_project.urlid}?/update">
								<input type="hidden" name="status" value={file.status} />
								<div
									role="button"
									on:click={async () => await toggleActive(file)}
									on:keypress={async () => await toggleActive(file)}
									tabindex="0"
								>
									<NavItem>
										<Icon name="toggle-{file.status == 'active' ? 'on' : 'off'}" />
										{file.original_name}
									</NavItem>
								</div>
							</form>
							<a href="/view/{selected_project.urlid}/{file.uid}/original" target="_blank"
								><Icon name="eye-fill" /></a
							>
						</div>
					{/each}
				</NavItem>
				<NavItem>
					<div class="bold"><Icon name="chat-dots" /> Chats</div>
					<a class="sidebar-item" href="/chat/{selected_project.urlid}">New Chat</a>
				</NavItem>
			</Nav>
		{/if}
	</Nav>
</div>

<style>
	.sidebar {
		height: calc(100vh - 50px);
	}
	
	.bold {
		font-weight: bold;
	}

	.sidebar-item {
		margin-left: 10px;
		display: flex;
		flex-direction: row;
	}
</style>
