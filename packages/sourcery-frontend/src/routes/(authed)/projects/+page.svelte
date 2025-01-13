<script>
	/** @type {import('./$types').PageData} */
	export let data;
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
</script>

<div class="bg-white dark:bg-gray-900 py-10">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:max-w-none">
			<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				<a
					href="/projects/new"
					class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-50 dark:bg-gray-800/30 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/50"
				>
					<div
						class="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 text-white"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
						New Project
					</h3>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Create a new project</p>
				</a>

				{#each data.projects as project}
					<div
						class="group relative rounded-lg bg-gray-50 dark:bg-gray-800/50 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/70"
					>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
									<a href="/project/{project._id}">{project.name}</a>
								</h3>
								{#if project.is_public}
									<span
										class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-400/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20"
									>
										Public
									</span>
								{/if}
							</div>
							{#if project.description}
								<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
									{project.description}
								</p>
							{/if}
							{#if project.created_at}
								<p class="mt-4 text-sm text-gray-500">
									{#if project.is_public}
										Created by {project.owner_name || project.owner_username}
										{dayjs(project.created_at).fromNow()}
									{:else}
										Created {dayjs(project.created_at).fromNow()}
									{/if}
								</p>
							{/if}
						</div>
						<div class="mt-6 flex flex-wrap gap-2 text-sm">
							<a
								href="/chat/{project._id}"
								class="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-4 h-4 mr-1"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
									/>
								</svg>
								Chat
							</a>
							<span class="text-gray-400 dark:text-gray-600">•</span>
							<a
								href="/files/{project._id}"
								class="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-4 h-4 mr-1"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
									/>
								</svg>
								Files
							</a>
							<span class="text-gray-400 dark:text-gray-600">•</span>
							<a
								href="/entity/{project._id}"
								class="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-4 h-4 mr-1"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
									/>
								</svg>
								Entities
							</a>
							<span class="text-gray-400 dark:text-gray-600">•</span>
							<a
								href="/project/{project._id}/settings"
								class="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-4 h-4 mr-1"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>
								Settings
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
