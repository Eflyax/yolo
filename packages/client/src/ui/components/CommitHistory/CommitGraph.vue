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
				:x="PADDING_LEFT + (commit.level ?? 0) * X_STEP - 1"
				:y="(commit.index ?? 0) * Y_STEP"
				:width="svgWidth"
				:height="Y_STEP - ROW_MARGIN"
				:fill="getColor(commit.level ?? 0)"
				:fill-opacity="selectedHash === commit.hash ? 0.18 : 0.06"
			/>

			<circle
				:cx="PADDING_LEFT + (commit.level ?? 0) * X_STEP"
				:cy="PADDING_TOP + (commit.index ?? 0) * Y_STEP - ROW_MARGIN"
				:r="commit.parents.length > 1 ? CIRCLE_R / 2 : CIRCLE_R"
				:fill="getColor(commit.level ?? 0)"
				:stroke="'#0d0f11'"
				:stroke-width="LINE_WIDTH"
			/>
		</g>
	</svg>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {ICommit} from '@/domain';

const COLORS = [
	'#30a0bf',
	'#0f69f7',
	'#8e02c2',
	'#9f544c',
	'#984c80',
	'#77509b',
];

const X_STEP = 20;
const Y_STEP = 28;
const PADDING_LEFT = 12;
const PADDING_TOP = 14;
const CIRCLE_R = 10;
const LINE_WIDTH = 3;
const ROW_MARGIN = 5;
const CORNER_R = 8;

const props = defineProps<{
	commits: readonly ICommit[]
	selectedHash?: string
}>();

const commitMap = computed(() => {
	const map = new Map<string, Readonly<ICommit>>();

	props.commits.forEach(c => map.set(c.hash, c));

	return map;
});

const svgWidth = computed(() => {
	if (!props.commits.length) return 0;
	const maxLevel = Math.max(...props.commits.map(c => c.level ?? 0));

	return (maxLevel + 1) * X_STEP + PADDING_LEFT + 16;
});

const svgHeight = computed(() => props.commits.length * Y_STEP + 10);

function getColor(level: number): string {
	return COLORS[level % COLORS.length]!;
}

function getPathColor(commit: Readonly<ICommit>, parentHash: string): string {
	const parent = commitMap.value.get(parentHash);
	const commitLevel = commit.level ?? 0;
	const parentLevel = parent?.level ?? commitLevel;
	const branchLevel = Math.max(commitLevel, parentLevel);

	return getColor(branchLevel);
}

function getPath(commit: Readonly<ICommit>, parentHash: string): string | undefined {
	const parent = commitMap.value.get(parentHash);

	if (!parent) return undefined;

	const cLevel = commit.level ?? 0;
	const cIndex = commit.index ?? 0;
	const pLevel = parent.level ?? 0;
	const pIndex = parent.index ?? 0;

	const sx = PADDING_LEFT + cLevel * X_STEP;
	const sy = PADDING_TOP + cIndex * Y_STEP - ROW_MARGIN;
	const ex = PADDING_LEFT + pLevel * X_STEP;
	const ey = PADDING_TOP + pIndex * Y_STEP - ROW_MARGIN;

	if (cLevel === pLevel) {
		return `M ${sx} ${sy + CIRCLE_R} L ${ex} ${ey - CIRCLE_R}`;
	}

	const xDir = ex > sx ? 1 : -1;
	const delta = cLevel - pLevel;

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
	height: 100%;
	width: 200px;
}
</style>
