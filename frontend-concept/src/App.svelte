<script>
	import { onMount } from 'svelte';
    import data from './fake-data.json';
	let projects = [];
	let selectedProject = null;
	let selectedChat = null;
	let selectedFile = null;

	// Function to toggle caret icon
	function toggleCaret(event) {
		const button = event.currentTarget;
		const icon = button.querySelector('i');
		icon.classList.toggle('bi-caret-right-fill');
		icon.classList.toggle('bi-caret-down-fill');
	}

	// Load fake data on component mount
	onMount(async () => {
		console.log(data);
		projects = data.projects;
	});

	function selectProject(project) {
		selectedProject = project;
		selectedChat = null; // Reset selected chat when a new project is selected
	}

	function selectChat(chat) {
		selectedChat = chat;
	}

	function selectFile(file) {
		selectedFile = file;
		document.getElementById('fileModal').style.display = 'block';
	}

	function closeModal() {
		document.getElementById('fileModal').style.display = 'none';
	}
</script>

<div class="container-fluid h-100 d-flex flex-column bg-dark text-light">
	<!-- Menu Bar -->
	<header class="navbar navbar-dark bg-dark">
		<span class="navbar-brand mb-0 h1">Sourcery.info</span>
	</header>

	<div class="row flex-grow-1">
		<!-- Sidebar -->
		<aside class="col-12 col-md-2 col-lg-1 p-3 bg-dark shadow">
			<ul class="nav flex-column">
				<li class="nav-item">
					<button class="btn btn-link nav-link text-light d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#projectsCollapse" aria-expanded="false" aria-controls="projectsCollapse" on:click={toggleCaret}>
						<i class="bi bi-caret-right-fill me-2"></i> Projects
					</button>
					<div class="collapse" id="projectsCollapse">
						<ul class="nav flex-column ms-3">
							{#each projects as project}
								<li class="nav-item">
									<a class="nav-link text-light {selectedProject === project ? 'active' : ''}" href="#" on:click={() => selectProject(project)}>{project.name}</a>
								</li>
							{/each}
						</ul>
					</div>
				</li>
				{#if selectedProject}
					<li class="nav-item">
						<button class="btn btn-link nav-link text-light d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#chatsCollapse" aria-expanded="false" aria-controls="chatsCollapse" on:click={toggleCaret}>
							<i class="bi bi-caret-right-fill me-2"></i> Chats
						</button>
						<div class="collapse" id="chatsCollapse">
							<ul class="nav flex-column ms-3">
								{#each selectedProject.chats as chat}
									<li class="nav-item">
										<a class="nav-link text-light {selectedChat === chat ? 'active' : ''}" href="#" on:click={() => selectChat(chat)}>{chat.name}</a>
									</li>
								{/each}
							</ul>
						</div>
					</li>
					<li class="nav-item">
						<button class="btn btn-link nav-link text-light d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#filesCollapse" aria-expanded="false" aria-controls="filesCollapse" on:click={toggleCaret}>
							<i class="bi bi-caret-right-fill me-2"></i> Files
						</button>
						<div class="collapse" id="filesCollapse">
							<ul class="nav flex-column ms-3">
								{#each selectedProject.files as file}
									<li class="nav-item"><a class="nav-link text-light" href="#" on:click={() => selectFile(file)}>{file.name} ({file.type}, {file.size})</a></li>
								{/each}
							</ul>
						</div>
					</li>
				{/if}
			</ul>
		</aside>

		<!-- Chat Screen -->
		<main class="col-12 col-md-10 col-lg-11 d-flex flex-column p-0">
			<!-- Message Window -->
			<div class="flex-grow-1 p-3 bg-secondary text-light overflow-auto">
				<!-- Messages will go here -->
				{#if selectedChat}
					{#each selectedChat.messages as message}
						<div class="message">
							<div class="message-header">
								<span class="message-sender">{message.sender}</span>
								<span class="message-timestamp">{message.timestamp}</span>
							</div>
							<div class="message-body">{message.content}</div>
						</div>
					{/each}
				{:else}
					<div class="message">
						<div class="message-body">Select a chat to view messages or start a new chat.</div>
					</div>
				{/if}
			</div>

			<!-- Prompt Bar -->
			<div class="d-flex p-3 border-top border-secondary bg-dark">
				<input type="text" class="form-control me-2 bg-secondary text-light border-0" placeholder="Type a message..." />
				<button class="btn btn-primary">Send</button>
			</div>
		</main>
	</div>
</div>

<!-- File Modal -->
<div id="fileModal" class="modal" style="display: none;">
	<div class="modal-dialog modal-dialog-centered modal-lg">
		<div class="modal-content bg-dark text-light">
			<div class="modal-header">
				<h5 class="modal-title" id="fileModalLabel">{selectedFile ? selectedFile.name : ''}</h5>
				<button type="button" class="btn-close" on:click={closeModal} aria-label="Close"></button>
			</div>
			<div class="modal-body">
				{#if selectedFile}
					<p><strong>Author:</strong> {selectedFile.author}</p>
					<p><strong>Date Created:</strong> {selectedFile.dateCreated}</p>
					<p><strong>Date Last Accessed:</strong> {selectedFile.dateLastAccessed}</p>
					<hr />
					<div class="file-preview bg-secondary p-3" style="height: 300px; overflow-y: auto;">
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
					</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" on:click={closeModal}>Close</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom styles can be added here if needed */
	.shadow {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	.nav-link.active {
		font-weight: bold;
		color: #0d6efd; /* Bootstrap primary color */
	}
	.message {
		margin-bottom: 1rem;
	}
	.message-header {
		font-weight: bold;
		display: flex;
		justify-content: space-between;
	}
	.message-body {
		margin-top: 0.5rem;
	}
	.file-preview {
		background-color: #343a40;
		border-radius: 0.25rem;
	}
	.modal {
		position: fixed;
		z-index: 1050;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		outline: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.5);
	}
	.modal-dialog {
		max-width: 800px;
		margin: 1.75rem auto;
	}
	.modal-content {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		pointer-events: auto;
		background-clip: padding-box;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 0.3rem;
		outline: 0;
	}
	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #dee2e6;
		border-top-left-radius: 0.3rem;
		border-top-right-radius: 0.3rem;
	}
	.modal-body {
		position: relative;
		flex: 1 1 auto;
		padding: 1rem;
	}
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 1rem;
		border-top: 1px solid #dee2e6;
	}
	.btn-close {
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
	}
</style>