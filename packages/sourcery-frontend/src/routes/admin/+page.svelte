<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, type ChartConfiguration } from 'chart.js/auto';
	import { goto } from '$app/navigation';

	type BucketSize = 'day' | 'week' | 'month';

	interface TimeSeriesData {
		date: Date;
		count: number;
	}

	interface TimeSeries {
		projects: TimeSeriesData[];
		users: TimeSeriesData[];
		entities: TimeSeriesData[];
		chunks: TimeSeriesData[];
		files: TimeSeriesData[];
	}

	interface TimeRange {
		start: Date;
		end: Date;
	}

	interface Stats {
		projects: { total: number; active: number };
		users: { total: number; active: number };
		conversations: { total: number; lastWeek: number };
		entities: { total: number };
		chunks: { total: number };
		files: { total: number };
	}

	interface PageData {
		stats: Stats;
		timeSeries: TimeSeries;
		timeRange: TimeRange;
		bucketSize: BucketSize;
	}

	export let data: PageData;
	$: ({ stats, timeSeries, timeRange, bucketSize } = data);

	let projectsChart: Chart;
	let usersDistributionChart: Chart;
	let timeSeriesCharts: Record<keyof TimeSeries, Chart | undefined> = {
		projects: undefined,
		users: undefined,
		entities: undefined,
		chunks: undefined,
		files: undefined
	};

	// Form controls
	let selectedBucketSize = bucketSize;
	let selectedStartDate: string;
	let selectedEndDate: string;

	// Convert dates to YYYY-MM-DD format for input[type="date"]
	$: {
		const start = new Date(timeRange.start);
		const end = new Date(timeRange.end);
		selectedStartDate = start.toISOString().split('T')[0];
		selectedEndDate = end.toISOString().split('T')[0];
	}

	const darkModeColors = {
		text: '#e5e7eb',
		gridLines: '#374151',
		primary: '#60a5fa',
		secondary: '#f87171',
		accent: '#c084fc',
		green: '#34d399',
		yellow: '#fbbf24',
		purple: '#a78bfa'
	};

	const chartConfig = {
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: {
						color: darkModeColors.text
					}
				}
			},
			scales: {
				x: {
					grid: {
						color: darkModeColors.gridLines
					},
					ticks: {
						color: darkModeColors.text
					}
				},
				y: {
					grid: {
						color: darkModeColors.gridLines
					},
					ticks: {
						color: darkModeColors.text
					}
				}
			}
		}
	};

	function formatDate(date: Date): string {
		return new Date(date).toLocaleString('default', { month: 'short', day: 'numeric' });
	}

	function createTimeSeriesChart(
		elementId: string,
		data: TimeSeriesData[],
		label: string,
		color: string
	) {
		const canvas = document.getElementById(elementId) as HTMLCanvasElement;
		if (!canvas) {
			console.error(`Canvas element ${elementId} not found`);
			return;
		}

		return new Chart(canvas, {
			type: 'line',
			data: {
				labels: data.map((d) => formatDate(new Date(d.date))),
				datasets: [
					{
						label,
						data: data.map((d) => d.count),
						borderColor: color,
						backgroundColor: `${color}33`,
						tension: 0.1,
						fill: true
					}
				]
			},
			options: {
				...chartConfig.options
			}
		});
	}

	function destroyCharts() {
		usersDistributionChart?.destroy();
		Object.values(timeSeriesCharts).forEach((chart) => chart?.destroy());
		timeSeriesCharts = {
			projects: undefined,
			users: undefined,
			entities: undefined,
			chunks: undefined,
			files: undefined
		};
	}

	function initCharts() {
		// User distribution chart
		usersDistributionChart = new Chart(
			document.getElementById('usersDistributionChart') as HTMLCanvasElement,
			{
				type: 'doughnut',
				data: {
					labels: ['Active', 'Inactive'],
					datasets: [
						{
							data: [stats.users.active, stats.users.total - stats.users.active],
							backgroundColor: [darkModeColors.primary, darkModeColors.secondary]
						}
					]
				},
				options: {
					...chartConfig.options,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								color: darkModeColors.text
							}
						}
					}
				}
			}
		);

		// Time series charts
		const timeSeriesConfigs = {
			projects: { label: 'Projects', color: darkModeColors.primary },
			users: { label: 'Users', color: darkModeColors.green },
			entities: { label: 'Entities', color: darkModeColors.yellow },
			chunks: { label: 'Chunks', color: darkModeColors.purple },
			files: { label: 'Files', color: darkModeColors.accent }
		} as const;

		(
			Object.entries(timeSeriesConfigs) as [keyof TimeSeries, { label: string; color: string }][]
		).forEach(([key, config]) => {
			timeSeriesCharts[key] = createTimeSeriesChart(
				`${key}TimeSeriesChart`,
				timeSeries[key],
				config.label,
				config.color
			);
		});
	}

	// Reinitialize charts when data changes
	$: {
		if (typeof window !== 'undefined') {
			destroyCharts();
			// Wait for the next tick to ensure DOM is updated
			setTimeout(() => {
				initCharts();
			}, 0);
		}
	}

	async function updateTimeRange() {
		const searchParams = new URLSearchParams();
		searchParams.set('bucket', selectedBucketSize);
		searchParams.set('start', new Date(selectedStartDate).toISOString());
		searchParams.set('end', new Date(selectedEndDate).toISOString());
		await goto(`?${searchParams.toString()}`, { invalidateAll: true });
	}

	onMount(() => {
		initCharts();
		return destroyCharts;
	});
</script>

<div class="p-6 bg-gray-900 min-h-screen">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold text-gray-100">Admin Dashboard</h1>

		<div class="flex gap-4 items-center">
			<div class="flex items-center gap-2">
				<label for="bucketSize" class="text-gray-300">Group by:</label>
				<select
					id="bucketSize"
					class="bg-gray-800 text-gray-300 rounded border border-gray-700 px-2 py-1"
					bind:value={selectedBucketSize}
					on:change={updateTimeRange}
				>
					<option value="day">Daily</option>
					<option value="week">Weekly</option>
					<option value="month">Monthly</option>
				</select>
			</div>

			<div class="flex items-center gap-2">
				<label for="startDate" class="text-gray-300">From:</label>
				<input
					type="date"
					id="startDate"
					class="bg-gray-800 text-gray-300 rounded border border-gray-700 px-2 py-1"
					bind:value={selectedStartDate}
					on:change={updateTimeRange}
				/>
			</div>

			<div class="flex items-center gap-2">
				<label for="endDate" class="text-gray-300">To:</label>
				<input
					type="date"
					id="endDate"
					class="bg-gray-800 text-gray-300 rounded border border-gray-700 px-2 py-1"
					bind:value={selectedEndDate}
					on:change={updateTimeRange}
				/>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
		<!-- Stats Cards -->
		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Projects</h3>
			<div class="flex justify-between text-gray-300">
				<p>Total: {stats.projects.total}</p>
				<p>Active: {stats.projects.active}</p>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Users</h3>
			<div class="flex justify-between text-gray-300">
				<p>Total: {stats.users.total}</p>
				<p>Active: {stats.users.active}</p>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Conversations</h3>
			<div class="flex justify-between text-gray-300">
				<p>Total: {stats.conversations.total}</p>
				<p>Last Week: {stats.conversations.lastWeek}</p>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Entities</h3>
			<p class="text-gray-300">Total: {stats.entities.total}</p>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Chunks</h3>
			<p class="text-gray-300">Total: {stats.chunks.total}</p>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-2 text-gray-200">Files</h3>
			<p class="text-gray-300">Total: {stats.files.total}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">Projects Growth</h3>
			<div class="h-[300px]">
				<canvas id="projectsTimeSeriesChart"></canvas>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">User Distribution</h3>
			<div class="h-[300px]">
				<canvas id="usersDistributionChart"></canvas>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">New Users</h3>
			<div class="h-[300px]">
				<canvas id="usersTimeSeriesChart"></canvas>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">New Entities</h3>
			<div class="h-[300px]">
				<canvas id="entitiesTimeSeriesChart"></canvas>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">New Chunks</h3>
			<div class="h-[300px]">
				<canvas id="chunksTimeSeriesChart"></canvas>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
			<h3 class="text-lg font-semibold mb-4 text-gray-200">New Files</h3>
			<div class="h-[300px]">
				<canvas id="filesTimeSeriesChart"></canvas>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: rgb(17, 24, 39);
	}

	input[type='date'] {
		color-scheme: dark;
	}
</style>
