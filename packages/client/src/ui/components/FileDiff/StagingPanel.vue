<template>
	<div class="staging-panel">
		<!-- Header -->
		<div class="staging-panel__header">
			<span class="staging-panel__branch-info">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
					<path d="M6 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7a1 1 0 0 0 1 1h8a2 2 0 0 1 2 2v.27c.6.34 1 .99 1 1.73a2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-.74.4-1.39 1-1.73V10a0 0 0 0 0 0 0H8a3 3 0 0 1-3-3V5.73A2 2 0 0 1 4 4a2 2 0 0 1 2-2m6 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/>
				</svg>
				<span>{{ totalCount }} file changes<template v-if="currentBranch"> on <strong>{{ currentBranch.name }}</strong></template></span>
			</span>
			<button class="staging-panel__stage-all" @click="handleStageAll">Stage All</button>
		</div>

		<!-- Unstaged files -->
		<div class="staging-panel__section">
			<div
				class="staging-panel__section-header"
				@click="unstagedExpanded = !unstagedExpanded"
			>
				<svg
					class="staging-panel__chevron"
					:class="{'staging-panel__chevron--open': unstagedExpanded}"
					width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
				>
					<path d="M7 10l5 5 5-5z"/>
				</svg>
				<span>Unstaged Files</span>
				<span class="staging-panel__count">{{ unstagedFiles.length }}</span>
			</div>

			<div v-if="unstagedExpanded" class="staging-panel__file-list">
				<div
					v-for="file in unstagedFiles"
					:key="file.path"
					class="staging-panel__file"
					:class="{'staging-panel__file--active': activePath === file.path}"
					@click="activePath = file.path; emit('openDiff', file.path)"
				>
					<div>
						<FileStatus :status="file.status" />

						<span class="staging-panel__file-name">{{ fileName(file.path) }}</span>
					</div>

					<NButton
						size="tiny"
						class="staging-panel__stage-action"
						type="success"
						secondary
						@click.stop="handleStageFile(file.path)"
					>
						Stage file
					</NButton>
				</div>
			</div>
		</div>

		<!-- Staged files -->
		<div class="staging-panel__section">
			<div
				class="staging-panel__section-header"
				@click="stagedExpanded = !stagedExpanded"
			>
				<svg
					class="staging-panel__chevron"
					:class="{'staging-panel__chevron--open': stagedExpanded}"
					width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
				>
					<path d="M7 10l5 5 5-5z"/>
				</svg>
				<span>Staged Files</span>
				<span class="staging-panel__count">{{ stagedFiles.length }}</span>
			</div>

			<div v-if="stagedExpanded" class="staging-panel__file-list">
				<div
					v-for="file in stagedFiles"
					:key="file.path"
					class="staging-panel__file"
					:class="{'staging-panel__file--active': activePath === file.path}"
					@click="activePath = file.path; emit('openDiff', file.path)"
				>
					<div>
						<FileStatus :status="file.status" />

						<span class="staging-panel__file-name">{{ fileName(file.path) }}</span>
					</div>

					<NButton
						size="tiny"
						class="staging-panel__stage-action"
						type="error"
						secondary
						@click.stop="handleUnstageFile(file.path)"
					>
						Unstage file
					</NButton>
				</div>
			</div>
		</div>

		<div class="staging-panel__spacer" />

		<!-- Commit form -->
		<div class="staging-panel__commit-form">
			<div class="staging-panel__commit-header">
				<span class="staging-panel__commit-label">Commit</span>
				<button class="staging-panel__reset-btn" title="Reset" @click="commitSummary = ''; commitDescription = ''">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
					</svg>
				</button>
				<button class="staging-panel__commit-btn">Commit</button>
			</div>

			<n-input
				v-model:value="commitSummary"
				placeholder="Commit summary"
				size="small"
				class="staging-panel__summary-input"
			/>

			<n-input
				v-model:value="commitDescription"
				type="textarea"
				placeholder="Description"
				size="small"
				:rows="3"
				class="staging-panel__description-input"
			/>

			<div class="staging-panel__options">
				<div
					class="staging-panel__options-header"
					@click="optionsExpanded = !optionsExpanded"
				>
					<svg
						class="staging-panel__chevron"
						:class="{'staging-panel__chevron--open': optionsExpanded}"
						width="11" height="11" viewBox="0 0 24 24" fill="currentColor"
					>
						<path d="M7 10l5 5 5-5z"/>
					</svg>
					<span>Commit options</span>
				</div>

				<div v-if="optionsExpanded" class="staging-panel__options-body">
					<label class="staging-panel__option-item">
						<input type="checkbox" v-model="stageChangesToFavorite" />
						<span>Stage Changes to Favorite</span>
					</label>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {NButton, NInput} from 'naive-ui';
import {useWorkingTree} from '@/composables/useWorkingTree';
import {useBranches} from '@/composables/useBranches';
import FileStatus from '../FileStatus.vue';

const emit = defineEmits<{
	openDiff: [filePath: string]
}>();

const {status, loadStatus, stageFile, stageAll, unstageFile} = useWorkingTree();
const {currentBranch} = useBranches();

const activePath = ref<string | null>(null);
const unstagedExpanded = ref(true);
const stagedExpanded = ref(true);
const optionsExpanded = ref(false);
const commitSummary = ref('');
const commitDescription = ref('');
const stageChangesToFavorite = ref(false);

const unstagedFiles = computed(() => status.value.unstaged);
const stagedFiles = computed(() => status.value.staged);

const totalCount = computed(() => {
	const paths = new Set([
		...unstagedFiles.value.map(f => f.path),
		...stagedFiles.value.map(f => f.path),
	]);

	return paths.size;
});

function fileName(path: string): string {
	const parts = path.split('/');

	return parts[parts.length - 1] ?? path;
}

async function handleStageFile(filePath: string): Promise<void> {
	await stageFile(filePath);
}

async function handleUnstageFile(filePath: string): Promise<void> {
	await unstageFile(filePath);
}

async function handleStageAll(): Promise<void> {
	await stageAll();
}

loadStatus();
</script>

<style scoped lang="scss">
.staging-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #111318;
	overflow: hidden;
	font-size: 12.5px;

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 10px;
		border-bottom: 1px solid #1e2228;
		flex-shrink: 0;
		gap: 8px;
	}

	&__branch-info {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #9ca3af;
		font-size: 12px;
		overflow: hidden;

		strong {
			color: #e5e7eb;
		}
	}

	&__stage-all {
		flex-shrink: 0;
		padding: 3px 10px;
		border: none;
		border-radius: 4px;
		background: rgba(111, 158, 248, 0.2);
		color: #6f9ef8;
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.1s;

		&:hover {
			background: rgba(111, 158, 248, 0.3);
		}
	}

	&__section {
		border-bottom: 1px solid #1e2228;
		flex-shrink: 0;
	}

	&__section-header {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 6px 10px;
		font-size: 13px;
		border-bottom: 1px solid #1e2228;
		color: #fff;
		cursor: pointer;
		user-select: none;

		&:hover {
			background-color: rgba(255, 255, 255, 0.03);
		}
	}

	&__count {
		margin-left: auto;
		font-size: 11px;
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
		padding: 1px 6px;
		border-radius: 8px;
	}

	&__chevron {
		transition: transform 0.15s;
		opacity: 0.6;

		&--open {
			transform: rotate(0deg);
		}

		&:not(&--open) {
			transform: rotate(-90deg);
		}
	}

	&__file-list {
		padding: 2px 0;
		min-height: 300px;
	}

	&__file {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		padding: 3px 10px 3px 20px;
		height: 30px;
		cursor: pointer;
		border-radius: 2px;

		&:hover {
			background-color: rgba(255, 255, 255, 0.04);

			.staging-panel__stage-action {
				display: inline-flex;
			}
		}

		&--active {
			background-color: rgba(111, 158, 248, 0.1);
		}
	}

	&__stage-action {
		display: none;
	}

	&__panel__checkbox {
		border: 2px solid red;
	}

	&__file-name {
		font-size: 12px;
		color: #c9d1d9;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__spacer {
		flex: 1;
	}

	&__commit-form {
		border-top: 1px solid #1e2228;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex-shrink: 0;
	}

	&__commit-header {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	&__commit-label {
		font-size: 12px;
		font-weight: 600;
		color: #e5e7eb;
		flex: 1;
	}

	&__reset-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: #6b7280;
		border-radius: 4px;
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
			color: #c9d1d9;
		}
	}

	&__commit-btn {
		padding: 4px 14px;
		border: none;
		border-radius: 4px;
		background: #6f9ef8;
		color: #0d0f11;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.1s;

		&:hover {
			background: #8fb4ff;
		}
	}

	&__summary-input,
	&__description-input {
		width: 100%;
	}

	&__options {
		border-radius: 4px;
		overflow: hidden;
	}

	&__options-header {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 4px 2px;
		font-size: 11px;
		color: #6b7280;
		cursor: pointer;
		user-select: none;

		&:hover {
			color: #9ca3af;
		}
	}

	&__options-body {
		padding: 4px 0;
	}

	&__option-item {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 3px 4px;
		font-size: 11.5px;
		color: #9ca3af;
		cursor: pointer;

		input {
			accent-color: #6f9ef8;
		}
	}
}
</style>
