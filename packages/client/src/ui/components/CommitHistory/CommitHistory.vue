<template>
	<div class="commit-history">
		<!-- Graph + rows -->
		<div class="commit-history__scroll" ref="scrollEl">
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
						@select="selectCommit(commit)"
						@contextmenu="onContextMenu(commit, $event)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import CommitGraph from './CommitGraph.vue';
import CommitRow from './CommitRow.vue';
import type {MockCommit} from './CommitRow.vue';

const ROW_HEIGHT = 28;

const selectedHash = ref<string | undefined>('a1b2c3d');

// Mock data matching the design
const commits: MockCommit[] = [
	{
		hash: 'a1b2c3d4e5f6a7b8',
		hash_abbr: 'a1b2c3d',
		subject: 'Merge branch \'hotfix/FOO-219\' into \'master\'',
		parents: ['b2c3d4e5', 'c3d4e5f6'],
		level: 0, index: 0,
		author_name: 'Jakub Záruba',
		author_date: '1 min ago',
		authorColor: '#6f9ef8',
		references: [{type: 'HEAD', name: 'HEAD'}, {type: 'branch', name: 'master'}],
	},
	{
		hash: 'b2c3d4e5f6a7b8c9',
		hash_abbr: 'b2c3d4e',
		subject: '[CMP] add missing \'master\' to relations',
		parents: ['d4e5f6a7'],
		level: 0, index: 1,
		author_name: 'Jakub Záruba',
		author_date: '2 hrs ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'c3d4e5f6a7b8c9d0',
		hash_abbr: 'c3d4e5f',
		subject: 'Merge branch \'hotfix/FOO-215\' into \'master\'',
		parents: ['d4e5f6a7', 'e5f6a7b8'],
		level: 0, index: 2,
		author_name: 'Jakub Záruba',
		author_date: '4 hrs ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'd4e5f6a7b8c9d0e1',
		hash_abbr: 'd4e5f6a',
		subject: '[CMP] CertificationNotification: add missing import',
		parents: ['f6a7b8c9'],
		level: 0, index: 3,
		author_name: 'Jakub Záruba',
		author_date: '6 hrs ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'e5f6a7b8c9d0e1f2',
		hash_abbr: 'e5f6a7b',
		subject: 'Merge branch \'hotfix/FOO-213\' into \'master\'',
		parents: ['f6a7b8c9', 'a7b8c9d0'],
		level: 0, index: 4,
		author_name: 'Tomáš Novák',
		author_date: '1 day ago',
		authorColor: '#f89b6f',
		references: [],
	},
	{
		hash: 'f6a7b8c9d0e1f2a3',
		hash_abbr: 'f6a7b8c',
		subject: '[FIX] Update questionnaire (MK - self_person, v0)',
		parents: ['a7b8c9d0'],
		level: 0, index: 5,
		author_name: 'Martin Kovář',
		author_date: '1 day ago',
		authorColor: '#6ff8a0',
		references: [],
	},
	{
		hash: 'a7b8c9d0e1f2a3b4',
		hash_abbr: 'a7b8c9d',
		subject: 'Merge branch \'feature/migration\' into \'master\'',
		parents: ['b8c9d0e1', 'c9d0e1f2'],
		level: 0, index: 6,
		author_name: 'Jakub Záruba',
		author_date: '2 days ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'b8c9d0e1f2a3b4c5',
		hash_abbr: 'b8c9d0e',
		subject: '[FIX] Reduce high-risk country check',
		parents: ['c9d0e1f2'],
		level: 0, index: 7,
		author_name: 'Jakub Záruba',
		author_date: '2 days ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'c9d0e1f2a3b4c5d6',
		hash_abbr: 'c9d0e1f',
		subject: '[FIX] Filter by question shares',
		parents: ['d0e1f2a3'],
		level: 0, index: 8,
		author_name: 'Tomáš Novák',
		author_date: '3 days ago',
		authorColor: '#f89b6f',
		references: [],
	},
	{
		hash: 'd0e1f2a3b4c5d6e7',
		hash_abbr: 'd0e1f2a',
		subject: '[FIX] Implement search response functionality',
		parents: ['e1f2a3b4'],
		level: 0, index: 9,
		author_name: 'Tomáš Novák',
		author_date: '3 days ago',
		authorColor: '#f89b6f',
		references: [],
	},
	{
		hash: 'e1f2a3b4c5d6e7f8',
		hash_abbr: 'e1f2a3b',
		subject: 'Merge branch \'release/4.2.0\' into \'master\'',
		parents: ['f2a3b4c5', 'a3b4c5d6'],
		level: 0, index: 10,
		author_name: 'Jakub Záruba',
		author_date: '4 days ago',
		authorColor: '#6f9ef8',
		references: [{type: 'tag', name: 'release and d…'}],
	},
	{
		hash: 'f2a3b4c5d6e7f8a9',
		hash_abbr: 'f2a3b4c',
		subject: '[FIX] Migration 24',
		parents: ['a3b4c5d6'],
		level: 0, index: 11,
		author_name: 'Martin Kovář',
		author_date: '4 days ago',
		authorColor: '#6ff8a0',
		references: [],
	},
	{
		hash: 'a3b4c5d6e7f8a9b0',
		hash_abbr: 'a3b4c5d',
		subject: '[FIX] Filter for transaction above the limit',
		parents: ['b4c5d6e7'],
		level: 0, index: 12,
		author_name: 'Jakub Záruba',
		author_date: '5 days ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'b4c5d6e7f8a9b0c1',
		hash_abbr: 'b4c5d6e',
		subject: '[FIX] diff',
		parents: ['c5d6e7f8'],
		level: 0, index: 13,
		author_name: 'Jakub Záruba',
		author_date: '5 days ago',
		authorColor: '#6f9ef8',
		references: [],
	},
	{
		hash: 'c5d6e7f8a9b0c1d2',
		hash_abbr: 'c5d6e7f',
		subject: 'Merge branch \'release/4.1.0\' into \'master\'',
		parents: ['d6e7f8a9'],
		level: 0, index: 14,
		author_name: 'Jakub Záruba',
		author_date: '6 days ago',
		authorColor: '#6f9ef8',
		references: [{type: 'tag', name: 'release and d…'}],
	},
];

const graphWidth = computed(() => {
	const maxLevel = Math.max(...commits.map(c => c.level));

	return (maxLevel + 1) * 20 + 12 + 16 + 4;
});

function selectCommit(commit: MockCommit): void {
	selectedHash.value = commit.hash ?? undefined;
}

function onContextMenu(_commit: MockCommit, _event: MouseEvent): void {
	// context menu – will be wired in Phase 5
}
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
}
</style>
