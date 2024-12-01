<script>
	// Deprecated
	/** @type {import('./$types').PageData} */
	import { TabContent, TabPane } from '@sveltestrap/sveltestrap';

	export let data;
</script>

<TabContent>
	<TabPane tabId="original" tab="Original" active>
		<h1>Original</h1>
		<iframe
			title="Original"
			src={`/view/${data.props.project}/${data.props.file?.uid}/original`}
			style="width: 100%; height: 100vh"
		></iframe>
	</TabPane>
	<!-- <TabPane tabId="markdown" tab="Markdown">
		<h1>Markdown</h1>
	</TabPane>
	<TabPane tabId="raw" tab="Raw">
		<h1>Raw</h1>
	</TabPane>
	<TabPane tabId="logs" tab="Logs">
		<h1>Logs</h1>
	</TabPane> -->
</TabContent>
