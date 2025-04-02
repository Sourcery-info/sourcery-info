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
	import { appVersionStore, setAppVersion, type AppVersion } from '$lib/i18n/config';

	const versions: AppVersion[] = ['private', 'cloud'];
</script>

<div class="fixed top-4 right-4 z-50">
	<select
		class="bg-white/10 text-white rounded-lg px-3 py-1.5 text-sm outline-none border border-white/20 hover:border-white/30 focus:border-indigo-500 transition-colors"
		bind:value={$appVersionStore}
		on:change={(e) => setAppVersion(e.currentTarget.value as AppVersion)}
	>
		{#each versions as version}
			<option value={version} class="bg-gray-900">
				{version.charAt(0).toUpperCase() + version.slice(1)} Version
			</option>
		{/each}
	</select>
</div>
