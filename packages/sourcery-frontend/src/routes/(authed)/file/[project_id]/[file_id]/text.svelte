<script>
	import { onMount } from 'svelte';

	export let data;

	let html = '';
	onMount(async () => {
		if (html !== '') return;
		const res = await fetch(`/file/${data.props.project_id}/${data.props.file._id}/view/md`);
		html = await res.text();
	});
</script>

<div class="p-6">
	<div
		class="prose max-w-none bg-gray-50 rounded-lg p-8 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)] prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight"
	>
		{@html html}
	</div>
</div>
