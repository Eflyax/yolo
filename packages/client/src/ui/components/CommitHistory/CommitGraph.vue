<template>
	<svg
		class="commit-graph"
		:width="svgWidth"
		:height="svgHeight"
	>
		<!-- Connection paths -->
		<g v-for="commit in commits" :key="'path-' + commit.hash">
			<template v-for="parentHash in commit.parents" :key="parentHash">
				<path
					v-if="commitMap.has(parentHash)"
					:d="getPath(commit, parentHash)"
					:stroke="getPathColor(commit, parentHash)"
					:stroke-width="LINE_WIDTH"
					fill="none"
					opacity="0.85"
					:stroke-dasharray="commit.isStash ? '3 2' : undefined"
				/>
			</template>
		</g>

		<!-- Commit nodes -->
		<g v-for="commit in commits" :key="'node-' + commit.hash">
			<rect
				:x="PADDING_LEFT + commit.level * X_STEP - 1"
				:y="commit.index * Y_STEP"
				:width="svgWidth"
				:height="Y_STEP - ROW_MARGIN"
				:fill="getColor(commit.level)"
				:fill-opacity="selectedHash === commit.hash ? 0.18 : 0.06"
			/>

			<circle
				:cx="PADDING_LEFT + commit.level * X_STEP"
				:cy="PADDING_TOP + commit.index * Y_STEP - ROW_MARGIN"
				:r="commit.parents.length > 1 ? CIRCLE_R / 2 : CIRCLE_R"
				:fill="getColor(commit.level)"
				:stroke="'#0d0f11'"
				:stroke-width="LINE_WIDTH"
			/>
		</g>
	</svg>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {MockCommit} from './CommitRow.vue';

const COLORS = [
	'#6f9ef8', '#f89b6f', '#6ff8a0', '#f86f6f',
	'#c46ff8', '#f8e56f', '#6feef8', '#f86fc4',
];

const X_STEP = 20;
const Y_STEP = 28;
const PADDING_LEFT = 12;
const PADDING_TOP = 14;
const CIRCLE_R = 5;
const LINE_WIDTH = 1.5;
const ROW_MARGIN = 5;
const CORNER_R = 8;

const props = defineProps<{
	commits: MockCommit[]
	selectedHash?: string
}>();

const commitMap = computed(() => {
	const map = new Map<string, MockCommit>();

	props.commits.forEach(c => map.set(c.hash, c));

	return map;
});

const svgWidth = computed(() => {
	if (!props.commits.length) return 0;
	const maxLevel = Math.max(...props.commits.map(c => c.level));

	return (maxLevel + 1) * X_STEP + PADDING_LEFT + 16;
});

const svgHeight = computed(() => props.commits.length * Y_STEP + 10);

function getColor(level: number): string {
	return COLORS[level % COLORS.length];
}

function getPathColor(commit: MockCommit, parentHash: string): string {
	const parent = commitMap.value.get(parentHash);
	const branchLevel = Math.max(commit.level, parent?.level ?? commit.level);

	return getColor(branchLevel);
}

function getPath(commit: MockCommit, parentHash: string): string | undefined {
	const parent = commitMap.value.get(parentHash);

	if (!parent) return undefined;

	const sx = PADDING_LEFT + commit.level * X_STEP;
	const sy = PADDING_TOP + commit.index * Y_STEP - ROW_MARGIN;
	const ex = PADDING_LEFT + parent.level * X_STEP;
	const ey = PADDING_TOP + parent.index * Y_STEP - ROW_MARGIN;

	if (commit.level === parent.level) {
		return `M ${sx} ${sy + CIRCLE_R} L ${ex} ${ey - CIRCLE_R}`;
	}

	const xDir = ex > sx ? 1 : -1;
	const delta = commit.level - parent.level;

	if (delta < 0) {
		const w = Math.abs(ex - sx);
		const h = Math.abs(ey - sy);
		const r = Math.min(CORNER_R, w / 2, h / 2);

		return `
			M ${sx + CIRCLE_R * xDir} ${sy}
			L ${ex - r * xDir} ${sy}
			Q ${ex} ${sy} ${ex} ${sy + r}
			L ${ex} ${ey - CIRCLE_R}
		`;
	}
	else {
		const h = Math.abs(ey - sy);
		const r = Math.min(CORNER_R, h / 2);

		return `
			M ${sx} ${sy + CIRCLE_R}
			L ${sx} ${ey - r}
			Q ${sx} ${ey} ${sx + r * xDir} ${ey}
			L ${ex - CIRCLE_R * xDir} ${ey}
		`;
	}
}
</script>

<style scoped lang="scss">
.commit-graph {
	display: block;
	flex-shrink: 0;
	pointer-events: none;
}
</style>
