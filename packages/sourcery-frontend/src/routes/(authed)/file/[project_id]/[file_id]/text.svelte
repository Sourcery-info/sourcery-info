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
		class="prose max-w-none bg-gray-50 rounded-lg p-8 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)] prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight"
	>
		{@html html}
	</div>
</div>
