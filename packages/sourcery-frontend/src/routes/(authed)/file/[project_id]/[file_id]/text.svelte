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
	export let data: any;

	let html = '';

	async function loadText() {
		const res = await fetch(`/file/${data.props.project_id}/${data.props.file._id}/view/md`);
		html = await res.text();
	}

	$: {
		if (data?.props?.file?._id) {
			loadText();
		}
	}
</script>

<div class="p-6">
	<div
		class="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)] prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight"
		style="max-height: calc(100vh - 300px); overflow-y: auto;"
	>
		{@html html}
	</div>
</div>
