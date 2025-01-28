<script lang="ts">
	import { page } from '$app/state';
	import { logError } from '@sourcery/common/src/logger';
	import { onMount } from 'svelte';

	onMount(() => {
		const currentPage = page;
		if (currentPage.error) {
			const error = currentPage.error;
			const errorContext = {
				status: currentPage.status,
				url: currentPage.url.pathname,
				route: currentPage.route.id,
				...(error instanceof Error
					? {
							name: error.name,
							stack: error.stack
						}
					: {}),
				...(error instanceof Object && 'status' in error
					? {
							httpStatus: error.status
						}
					: {})
			};
			logError(error instanceof Error ? error : new Error(String(error)), errorContext);
		}
	});
</script>

<div class="flex items-center justify-center h-full text-white">
	<div class="text-center p-8 max-w-[1200px] w-full">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="lg:text-left">
				<h1 class="text-[10rem] font-bold text-red-500 leading-none mb-4">
					{page.status}
				</h1>
				<h2 class="text-4xl font-light mb-8 p-4 rounded-xl">
					Oops... something has gone horribly wrong
				</h2>
				<p class="text-xl text-zinc-400 mb-12 leading-relaxed bg-blue-100/10 p-4 rounded-xl">
					{page.error?.message || 'Looks like our robot is having trouble'}
				</p>
				<a
					href="/"
					class="inline-flex items-center px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 gap-2 group"
				>
					<span>Take Me Home</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5 group-hover:translate-x-1 transition-transform"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
			</div>
			<div class="relative">
				<!-- Spotlight effect -->
				<div
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-100/10 rounded-full blur-3xl"
				></div>

				<!-- Robot SVG -->
				<svg
					class="w-full h-auto max-w-lg mx-auto"
					viewBox="0 0 200 200"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<!-- Robot head with antenna -->
					<path d="M100 35 L100 15" class="stroke-white stroke-2" stroke-linecap="round" />
					<circle cx="100" cy="12" r="4" class="fill-red-500 animate-pulse" />

					<!-- Head -->
					<rect
						x="70"
						y="35"
						width="60"
						height="60"
						class="stroke-white stroke-2"
						rx="8"
						fill="none"
					/>

					<!-- Eyes with expressions -->
					<circle cx="85" cy="60" r="6" class="fill-white" />
					<circle cx="115" cy="60" r="6" class="fill-white" />
					<circle cx="85" cy="62" r="2" class="fill-black worried-eyes" />
					<circle cx="115" cy="62" r="2" class="fill-black worried-eyes" />
					<!-- Worried eyebrows -->
					<path d="M80 52 Q87 50 94 52" class="stroke-white stroke-2" stroke-linecap="round" />
					<path d="M106 52 Q113 50 120 52" class="stroke-white stroke-2" stroke-linecap="round" />
					<!-- Worried mouth -->
					<path d="M85 80 L115 83" class="stroke-white stroke-2" stroke-linecap="round" />

					<!-- Body -->
					<rect
						x="80"
						y="105"
						width="40"
						height="45"
						class="stroke-white stroke-2"
						rx="4"
						fill="none"
					/>
					<rect x="90" y="115" width="20" height="25" class="stroke-white stroke-2" fill="none" />
					<circle
						cx="100"
						cy="127"
						r="6"
						class="stroke-white stroke-2 fill-red-500/20 animate-pulse"
					/>

					<!-- Arms -->
					<circle cx="80" cy="115" r="3" class="fill-white" />
					<circle cx="120" cy="115" r="3" class="fill-white" />
					<path d="M80 115 L50 115" class="stroke-white stroke-2" stroke-linecap="round" />
					<path d="M120 115 L150 115" class="stroke-white stroke-2" stroke-linecap="round" />
					<circle cx="45" cy="115" r="5" class="stroke-white fill-none stroke-2" />
					<circle cx="155" cy="115" r="5" class="stroke-white fill-none stroke-2" />

					<!-- Legs -->
					<path d="M90 150 L80 180" class="stroke-white stroke-2" stroke-linecap="round" />
					<path d="M110 150 L120 180" class="stroke-white stroke-2" stroke-linecap="round" />
					<rect x="75" y="180" width="10" height="5" class="stroke-white stroke-2" fill="none" />
					<rect x="115" y="180" width="10" height="5" class="stroke-white stroke-2" fill="none" />

					<!-- Wheels -->
					<circle cx="45" cy="160" r="12" class="stroke-white stroke-2" fill="none" />
					<path d="M45 148 L45 172" class="stroke-white stroke-2" />
					<path d="M33 160 L57 160" class="stroke-white stroke-2" />

					<circle cx="155" cy="160" r="12" class="stroke-white stroke-2" fill="none" />
					<path d="M155 148 L155 172" class="stroke-white stroke-2" />
					<path d="M143 160 L167 160" class="stroke-white stroke-2" />
				</svg>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes worried-eyes {
		0%,
		100% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(3px, -4px);
		}
		75% {
			transform: translate(-2px, 2px);
		}
	}
	.worried-eyes {
		animation: worried-eyes 10s ease-in-out infinite;
	}
</style>
