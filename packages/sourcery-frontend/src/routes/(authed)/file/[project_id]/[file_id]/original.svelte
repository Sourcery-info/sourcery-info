<script>
	export let data;
</script>

<iframe
	title="Original"
	src={`/file/${data.props.project_id}/${data.props.file._id}/view/original`}
	style="width: 100%; height: 100vh"
></iframe>
