<template>
	<div class="commit-history">
		<!-- Loading overlay -->
		<div v-if="loading && !commits.length" class="commit-history__loading">
			<n-spin size="small" />
		</div>

		<!-- Empty state – no project -->
		<div v-else-if="!currentProject" class="commit-history__empty">
			<Icon name="mdi-source-repository" />
			<span>No repository open</span>
		</div>

		<!-- Empty state – no commits yet -->
		<div v-else-if="!commits.length && !loading" class="commit-history__empty">
			<Icon name="mdi-git" />
			<span>No commits found</span>
		</div>

		<!-- Graph + rows -->
		<div v-else class="commit-history__scroll" ref="scrollEl">
			<div class="commit-history__content" :style="{height: commits.length * ROW_HEIGHT + 'px'}">
				<!-- SVG graph overlay -->
				<div class="commit-history__graph-col">
					<CommitGraph
						:commits="commits"
						:selected-hash="selectedHash"
					/>
				</div>

				<!-- Commit rows -->
				<div class="commit-history__rows" :style="{marginLeft: graphWidth + 'px'}">
					<CommitRow
						v-for="commit in commits"
						:key="commit.hash"
						:commit="commit"
						:is-selected="selectedHash === commit.hash"
						@select="handleSelectCommit(commit)"
						@contextmenu="onContextMenu(commit, $event)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {NSpin, useMessage} from 'naive-ui';
import CommitGraph from './CommitGraph.vue';
import CommitRow from './CommitRow.vue';
import Icon from '@/ui/components/Icon.vue';
import {useCommits} from '@/composables/useCommits';
import {useWorkingTree} from '@/composables/useWorkingTree';
import {useStash} from '@/composables/useStash';
import {useProject} from '@/composables/useProject';
import {useLayout} from '@/composables/useLayout';
import type {ICommit} from '@/domain';

const ROW_HEIGHT = 28;

const message = useMessage();
const {commits, selectedHashes, selectCommit, loadCommits} = useCommits();
const {loadStatus} = useWorkingTree();
const {loadStashes} = useStash();
const {currentProject} = useProject();
const {loading} = useLayout();

const scrollEl = ref<HTMLElement | null>(null);

// First selected hash → drives graph highlight and row selection
const selectedHash = computed(() => selectedHashes.value[0]);

const graphWidth = computed(() => {
	if (!commits.value.length) return 0;
	const maxLevel = Math.max(...commits.value.map(c => c.level ?? 0));

	return (maxLevel + 1) * 20 + 12 + 16 + 4;
});

async function refresh(): Promise<void> {
	if (!currentProject.value) {
		return;
	}

	try {
		await Promise.all([
			loadStatus(),
			loadStashes(),
			loadCommits(),
		]);
	}
	catch (e: unknown) {
		message.error(e instanceof Error ? e.message : 'Failed to load repository data');
	}
}

function handleSelectCommit(commit: ICommit): void {
	selectCommit(commit.hash);
}

function onContextMenu(_commit: ICommit, _event: MouseEvent): void {
	// context menu – Phase 5
}

onMounted(refresh);

watch(() => currentProject.value, refresh);
</script>

<style scoped lang="scss">
.commit-history {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background-color: #0d0f11;

	&__scroll {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	&__content {
		position: relative;
	}

	&__graph-col {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		pointer-events: none;
	}

	&__rows {
		width: 100%;
	}

	&__loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #555;
	}

	&__empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		color: #3a3f48;
		font-size: 0.85em;

		svg {
			width: 32px;
			height: 32px;
			opacity: 0.4;
		}
	}
}
</style>
