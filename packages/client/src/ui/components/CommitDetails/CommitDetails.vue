<template>
	<div class="commit-details">
		<template v-if="selectedCommit">
			<!-- Hash -->
			<div class="commit-details__hash-row">
				<span class="commit-details__hash">{{ selectedCommit.hashAbbr }}</span>
				<span class="commit-details__hash-full">parents: {{ selectedCommit.parents.length }}</span>
			</div>

			<!-- Title -->
			<div class="commit-details__title">{{ selectedCommit.subject }}</div>

			<!-- Author -->
			<div class="commit-details__author">
				<div
					class="commit-details__avatar"
					:style="{background: authorColor}"
				>
					{{ avatarLetter }}
				</div>
				<div class="commit-details__author-info">
					<span class="commit-details__author-name">{{ selectedCommit.authorName || 'Working Tree' }}</span>
					<span class="commit-details__author-date">{{ selectedCommit.authorDate }}</span>
				</div>
			</div>

			<!-- Parent hashes -->
			<div class="commit-details__meta-row" v-if="selectedCommit.parents.length">
				<CommitFileStats
					:A="filesStatuses[EFileStatus.Added]"
					:M="filesStatuses[EFileStatus.Modified]"
					:D="filesStatuses[EFileStatus.Deleted]"
					:R="filesStatuses[EFileStatus.Renamed]"
				/>

				<span class="commit-details__meta-label">Parent</span>
				<span
					v-for="p in selectedCommit.parents"
					:key="String(p)"
					class="commit-details__parent-hash"
				>{{ String(p).slice(0, 7) }}</span>
			</div>

			<!-- File list -->
			<div class="commit-details__files">
				<ChangedFileItem
					v-for="file in commitFiles ?? []"
					:key="file.path"
					:path="file.path"
					:status="(file.status as EFileStatus)"
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
import {computed, watch} from 'vue';
import ChangedFileItem from './ChangedFileItem.vue';
import CommitFileStats from '@/ui/components/CommitFileStats.vue';
import {useCommits} from '@/composables/useCommits';
import {getGraphColor} from '@/ui/components/CommitHistory/graphColors';
import {EFileStatus} from '@/domain/enums';

const emit = defineEmits<{
	openDiff: [filePath: string]
}>();

const {selectedHashes, commitMap, commitFiles, loadCommitDetails} = useCommits();

const selectedCommit = computed(() => {
	const hash = selectedHashes.value[0];

	return hash ? commitMap.value.get(hash) : undefined;
});

const filesStatuses = computed(() => {
	return {
		[EFileStatus.Modified]: commitFiles.value?.filter(file => file.status === EFileStatus.Modified).length ?? 0,
		[EFileStatus.Added]: commitFiles.value?.filter(file => file.status === EFileStatus.Added).length ?? 0,
		[EFileStatus.Deleted]: commitFiles.value?.filter(file => file.status === EFileStatus.Deleted).length ?? 0,
		[EFileStatus.Renamed]: commitFiles.value?.filter(file => file.status === EFileStatus.Renamed).length ?? 0,
	};
});

const authorColor = computed(() => getGraphColor(selectedCommit.value?.level ?? 0));

const avatarLetter = computed(() => {
	const name = selectedCommit.value?.authorName ?? '';

	return name ? name.charAt(0).toUpperCase() : '?';
});

watch(
	selectedHashes,
	(hashes) => {
		loadCommitDetails(hashes);
	},
	{immediate: true},
);
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
