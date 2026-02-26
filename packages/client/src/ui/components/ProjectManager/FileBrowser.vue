<template>
	<div class="file-browser">
		<div v-if="initializing" class="state-msg">
			Connecting to server…
		</div>

		<div v-else-if="errorMsg" class="state-msg state-msg--error">
			{{ errorMsg }}
		</div>

		<template v-else>
			<div class="breadcrumb">
				<span
					v-for="(segment, i) in pathSegments"
					:key="i"
					class="segment"
					@click="navigateTo(pathUpTo(i))"
				>
					{{ segment || '/' }}<span v-if="i < pathSegments.length - 1" class="sep">/</span>
				</span>
			</div>

			<div class="file-list">
				<div v-if="loading" class="state-msg">Loading…</div>

				<template v-else>
					<div
						v-if="currentPath !== '/'"
						class="entry entry--dir"
						@click="navigateUp"
					>
						<Icon name="mdi-arrow-up" />
						<span>..</span>
					</div>

					<div
						v-for="entry in entries"
						:key="entry.name"
						class="entry"
						:class="{'entry--dir': entry.isDirectory, 'entry--file': !entry.isDirectory}"
						@click="entry.isDirectory ? navigateTo(joinPath(currentPath, entry.name)) : undefined"
					>
						<Icon :name="entry.isDirectory ? 'mdi-folder' : 'mdi-file-outline'" />
						<span>{{ entry.name }}</span>
					</div>

					<div v-if="entries.length === 0" class="state-msg">Empty directory</div>
				</template>
			</div>

			<div class="footer">
				<span class="current-path">{{ currentPath }}</span>
				<n-button type="success" size="small" @click="emit('select', currentPath)">
					Select this folder
				</n-button>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue';
import {NButton, useMessage} from 'naive-ui';
import {WebSocketClient} from '@/infrastructure/websocket/WebSocketClient';
import {ENetworkCommand} from '@/domain';
import Icon from '@/ui/components/Icon.vue';

interface IDirEntry {
	name: string;
	isDirectory: boolean;
}

interface IBrowseResult {
	path: string;
	entries: IDirEntry[];
}

const props = defineProps<{
	server: string;
	port: number;
	initialPath?: string;
}>();

const emit = defineEmits<{
	select: [path: string];
}>();

const message = useMessage();
const initializing = ref(true);
const errorMsg = ref('');
const loading = ref(false);
const currentPath = ref(props.initialPath ?? '/');
const entries = ref<IDirEntry[]>([]);
let client: WebSocketClient | null = null;

const pathSegments = computed(() => {
	if (currentPath.value === '/') return ['/'];
	return ['/', ...currentPath.value.split('/').filter(Boolean)];
});

const parentPath = computed(() => {
	const parts = currentPath.value.split('/').filter(Boolean);
	if (parts.length <= 1) return '/';
	return '/' + parts.slice(0, -1).join('/');
});

function pathUpTo(index: number): string {
	if (index === 0) return '/';
	const segs = currentPath.value.split('/').filter(Boolean);
	return '/' + segs.slice(0, index).join('/');
}

function joinPath(base: string, name: string): string {
	return base === '/' ? `/${name}` : `${base}/${name}`;
}

async function loadDirectory(path: string): Promise<void> {
	if (!client) return;
	loading.value = true;

	try {
		const result = await client.call(ENetworkCommand.BrowseFiles, {path}) as IBrowseResult;
		entries.value = result.entries;
		currentPath.value = result.path;
	}
	finally {
		loading.value = false;
	}
}

function navigateTo(path: string): void {
	loadDirectory(path).catch((e: unknown) => {
		message.error(e instanceof Error ? e.message : 'Failed to load directory');
	});
}

function navigateUp(): void {
	navigateTo(parentPath.value);
}

onMounted(async () => {
	try {
		client = new WebSocketClient(`ws://${props.server}:${props.port}`);
		await loadDirectory(currentPath.value);
	}
	catch (e: unknown) {
		errorMsg.value = e instanceof Error ? e.message : 'Connection failed';
	}
	finally {
		initializing.value = false;
	}
});

onUnmounted(() => {
	client?.close();
	client = null;
});
</script>

<style scoped>
.file-browser {
	display: flex;
	flex-direction: column;
	height: 480px;
	gap: 8px;
}

.state-msg {
	padding: 12px;
	color: #888;
	font-size: 0.9em;

	&--error {
		color: #f87171;
	}
}

.breadcrumb {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 2px;
	padding: 6px 10px;
	background: #1a1d21;
	border-radius: 4px;
	font-size: 0.85em;

	.segment {
		cursor: pointer;
		color: #888;
		white-space: nowrap;

		&:hover { color: #fff; }
		&:last-child { color: #fff; cursor: default; }

		.sep {
			margin: 0 2px;
			color: #444;
		}
	}
}

.file-list {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 1px;
}

.entry {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 5px 10px;
	border-radius: 4px;
	user-select: none;
	font-size: 0.9em;

	&--dir {
		cursor: pointer;
		color: #7ec8e3;
		&:hover { background: #22262c; }
	}

	&--file {
		color: #888;
		cursor: default;
	}
}

.footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding-top: 8px;
	border-top: 1px solid #2a2e35;

	.current-path {
		flex: 1;
		font-size: 0.8em;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
