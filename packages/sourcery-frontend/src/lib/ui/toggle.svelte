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
	export let checked: boolean;
	export let onChange: (event: Event) => void;
	export let label: string;
	export let disabled = false;
</script>

<button
	on:click={onChange}
	type="button"
	class="flex-shrink-0 relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {checked
		? 'bg-indigo-600'
		: 'bg-gray-200'} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
>
	<span class="sr-only">{label}</span>
	<span
		class="pointer-events-none relative inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {checked
			? 'translate-x-5'
			: 'translate-x-0'}"
	>
		<span
			class="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-200 ease-in {checked
				? 'opacity-0'
				: 'opacity-100'}"
			aria-hidden="true"
		>
			<svg class="size-3 text-gray-400" fill="none" viewBox="0 0 12 12">
				<path
					d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		<span
			class="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-200 ease-in {checked
				? 'opacity-100'
				: 'opacity-0'}"
			aria-hidden="true"
		>
			<svg class="size-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
				<path
					d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
				/>
			</svg>
		</span>
	</span>
</button>
