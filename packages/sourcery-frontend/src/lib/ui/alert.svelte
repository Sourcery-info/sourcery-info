<!--
 Copyright (C) 2025 Jason Norwood-Young
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	export let variant: 'warning' | 'error' | 'success' | 'info' = 'info';
	export let title: string | undefined = undefined;
	export let dismissible = false;

	let visible = true;

	const variants = {
		warning: {
			container: 'bg-yellow-50',
			icon: 'text-yellow-400',
			title: 'text-yellow-800',
			content: 'text-yellow-700',
			button:
				'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50',
			path: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
		},
		error: {
			container: 'bg-red-50',
			icon: 'text-red-400',
			title: 'text-red-800',
			content: 'text-red-700',
			button: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50',
			path: 'M10 14a1 1 0 0 1-.755-.349L5.329 9.182a1.367 1.367 0 0 1-.205-1.46A1.184 1.184 0 0 1 6.2 7h7.6a1.18 1.18 0 0 1 1.074.721 1.357 1.357 0 0 1-.2 1.457l-3.918 4.473A1 1 0 0 1 10 14z M10 18a1 1 0 0 1-1-1v-8a1 1 0 0 1 2 0v8a1 1 0 0 1-1 1z'
		},
		success: {
			container: 'bg-green-50',
			icon: 'text-green-400',
			title: 'text-green-800',
			content: 'text-green-700',
			button:
				'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50',
			path: 'M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z'
		},
		info: {
			container: 'bg-blue-50',
			icon: 'text-blue-400',
			title: 'text-blue-800',
			content: 'text-blue-700',
			button:
				'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50',
			path: 'M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-11a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V7zm-1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'
		}
	};

	function dismiss() {
		visible = false;
	}
</script>

{#if visible}
	<div class="rounded-md p-4 {variants[variant].container}">
		<div class="flex">
			<div class="shrink-0">
				<svg
					class="size-5 {variants[variant].icon}"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path fill-rule="evenodd" d={variants[variant].path} clip-rule="evenodd" />
				</svg>
			</div>
			<div class="ml-3">
				{#if title}
					<h3 class="text-sm font-medium {variants[variant].title}">
						{title}
					</h3>
				{/if}
				<div class="mt-2 text-sm {variants[variant].content}">
					<slot />
				</div>
			</div>
			{#if dismissible}
				<div class="ml-auto pl-3">
					<div class="-mx-1.5 -my-1.5">
						<button
							type="button"
							class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 {variants[
								variant
							].button}"
							on:click={dismiss}
						>
							<span class="sr-only">Dismiss</span>
							<svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
								/>
							</svg>
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
