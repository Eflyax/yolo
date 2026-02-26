<template>
	<div class="commit-details">
		<template v-if="commit">
			<!-- Hash -->
			<div class="commit-details__hash-row">
				<span class="commit-details__hash">{{ commit.hash_abbr }}</span>
				<span class="commit-details__hash-full">commits: {{ commit.parents.length }}</span>
			</div>

			<!-- Title -->
			<div class="commit-details__title">{{ commit.subject }}</div>

			<!-- Author -->
			<div class="commit-details__author">
				<div
					class="commit-details__avatar"
					:style="{background: commit.authorColor}"
				>
					{{ commit.author_name.charAt(0) }}
				</div>
				<div class="commit-details__author-info">
					<span class="commit-details__author-name">{{ commit.author_name }}</span>
					<span class="commit-details__author-date">{{ commit.author_date }}</span>
				</div>
			</div>

			<!-- Parent -->
			<div class="commit-details__meta-row">
				<span class="commit-details__meta-label">Parent</span>
				<span
					v-for="p in commit.parents"
					:key="p"
					class="commit-details__parent-hash"
				>{{ p.slice(0, 7) }}</span>
			</div>

			<!-- Stats -->
			<div class="commit-details__stats">
				<span class="commit-details__stat">
					<span class="commit-details__stat-count">{{ changedFiles.length }}</span>
					modified
				</span>
			</div>

			<!-- File list -->
			<div class="commit-details__files">
				<ChangedFileItem
					v-for="file in changedFiles"
					:key="file.path"
					:path="file.path"
					:status="file.status"
					@open="emit('openDiff', file.path)"
				/>
			</div>
		</template>

		<div v-else class="commit-details__empty">
			Select a commit to view details
		</div>
	</div>
</template>

<script setup lang="ts">
import ChangedFileItem from './ChangedFileItem.vue';

interface CommitDetail {
	hash_abbr: string
	subject: string
	parents: string[]
	author_name: string
	author_date: string
	authorColor: string
}

interface ChangedFile {
	path: string
	status: 'A' | 'M' | 'D' | 'R'
}

const emit = defineEmits<{
	openDiff: [filePath: string]
}>();

const commit: CommitDetail = {
	hash_abbr: '36,753',
	subject: 'Merge branch \'hotfix/FOO-219\' into \'master\'',
	parents: ['a1b2c3d4e5f6', 'b2c3d4e5f6a7'],
	author_name: 'Jakub Záruba',
	author_date: 'Released 20.01.2026 at 9:23',
	authorColor: '#6f9ef8',
};

const changedFiles: ChangedFile[] = [
	{path: 'src/orchestration/Orchestration.ts', status: 'M'},
	{path: 'src/orchestration/factors/factors/HandlerSanctioned.ts', status: 'M'},
	{path: 'src/orchestration/factors/factors/HandlerSuspicious.ts', status: 'M'},
	{path: 'src/orchestration/types.ts', status: 'M'},
];
</script>

<style scoped lang="scss">
.commit-details {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #111318;
	overflow: hidden;

	&__empty {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #4b5563;
		font-size: 13px;
	}

	&__hash-row {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		padding: 8px 12px 4px;
	}

	&__hash {
		font-family: monospace;
		font-size: 11px;
		color: #374151;
	}

	&__hash-full {
		font-size: 10.5px;
		color: #4b5563;
	}

	&__title {
		padding: 4px 12px 12px;
		font-size: 14px;
		font-weight: 600;
		color: #e5e7eb;
		line-height: 1.4;
		border-bottom: 1px solid #1e2228;
	}

	&__author {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-bottom: 1px solid #1e2228;
	}

	&__avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		color: #0d0f11;
		flex-shrink: 0;
	}

	&__author-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	&__author-name {
		font-size: 12.5px;
		font-weight: 600;
		color: #e5e7eb;
	}

	&__author-date {
		font-size: 11px;
		color: #6b7280;
	}

	&__meta-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-bottom: 1px solid #1e2228;
	}

	&__meta-label {
		font-size: 11px;
		color: #4b5563;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		font-weight: 600;
	}

	&__parent-hash {
		font-family: monospace;
		font-size: 11px;
		padding: 1px 6px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 3px;
		color: #9ca3af;
		cursor: pointer;

		&:hover {
			background: rgba(111, 158, 248, 0.15);
			color: #6f9ef8;
		}
	}

	&__stats {
		padding: 8px 12px;
		border-bottom: 1px solid #1e2228;
	}

	&__stat {
		font-size: 12px;
		color: #6b7280;
	}

	&__stat-count {
		font-weight: 700;
		color: #f89b6f;
	}

	&__tabs {
		display: flex;
		gap: 2px;
		padding: 6px 12px 4px;
		border-bottom: 1px solid #1e2228;
	}

	&__tab {
		padding: 3px 12px;
		border: none;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		background: transparent;
		color: #6b7280;
		transition: all 0.1s;

		&:hover {
			color: #c9d1d9;
			background: rgba(255, 255, 255, 0.05);
		}

		&--active {
			background: rgba(111, 158, 248, 0.15);
			color: #6f9ef8;
			font-weight: 500;
		}
	}

	&__files {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
	}
}
</style>
