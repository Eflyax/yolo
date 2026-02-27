<template>
	<div class="staging-panel">
		<!-- Header -->
		<div class="staging-panel__header">
			<NButton
				test-id="discard-all-btn"
				size="tiny"
				type="error"
				ghost
				title="Discard all changes"
				@click="showDiscardConfirm = true"
			>
				<template #icon><Icon name="mdi-trash-can" /></template>
			</NButton>
			<span class="staging-panel__branch-info">
				<span>{{ totalCount }} file changes<template v-if="currentBranch"> on <strong>{{ currentBranch.name }}</strong></template></span>
			</span>
		</div>

		<!-- File sections (scrollable) -->
		<div class="staging-panel__files">
			<!-- Unstaged files -->
			<div class="staging-panel__section">
				<div
					class="staging-panel__section-header"
				>
					<div test-id="unstaged-section-header" @click="unstagedExpanded = !unstagedExpanded">
						<svg
							class="staging-panel__chevron"
							:class="{'staging-panel__chevron--open': unstagedExpanded}"
							width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
						>
							<path d="M7 10l5 5 5-5z"/>
						</svg>
						<span>Unstaged Files ({{ unstagedFiles.length }})</span>
					</div>
					<NButton
						test-id="stage-all-btn"
						v-if="unstagedFiles.length"
						class="staging-panel__stage-all"
						size="tiny"
						type="success"
						secondary
						@click="stageAll"
					>
						Stage all changes
					</NButton>
				</div>

				<div v-if="unstagedExpanded" class="staging-panel__file-list">
					<div
						v-for="file in unstagedFiles"
						:key="file.path"
						test-id="unstaged-file"
						class="staging-panel__file"
						:class="{'staging-panel__file--active': activePath === file.path}"
						@click="handleFileClick(file.path)"
						@contextmenu.prevent="contextMenuFile($event, file.path)"
					>
						<div>
							<FileStatus :status="file.status" />

							<span class="staging-panel__file-name">{{ fileName(file.path) }}</span>
						</div>

						<NButton
							test-id="stage-file-btn"
							size="tiny"
							class="staging-panel__stage-all"
							type="success"
							secondary
							@click.stop="stageFile(file.path)"
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
				>
					<div test-id="staged-section-header" @click="stagedExpanded = !stagedExpanded">
						<svg
							class="staging-panel__chevron"
							:class="{'staging-panel__chevron--open': stagedExpanded}"
							width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
						>
							<path d="M7 10l5 5 5-5z"/>
						</svg>
						<span>Staged Files ({{ stagedFiles.length }})</span>
					</div>
					<NButton
						test-id="unstage-all-btn"
						v-if="stagedFiles.length"
						size="tiny"
						secondary
						type="error"
						class="staging-panel__stage-all"
						@click="unstageAll"
					>
						Unstage all changes
					</NButton>
				</div>

				<div v-if="stagedExpanded" class="staging-panel__file-list">
					<div
						v-for="file in stagedFiles"
						:key="file.path"
						test-id="staged-file"
						class="staging-panel__file"
						:class="{'staging-panel__file--active': activePath === file.path}"
						@click="handleFileClick(file.path)"
					>
						<div>
							<FileStatus :status="file.status" />

							<span class="staging-panel__file-name">{{ fileName(file.path) }}</span>
						</div>

						<NButton
							test-id="unstage-file-btn"
							size="tiny"
							class="staging-panel__stage-action"
							type="error"
							secondary
							@click.stop="unstageFile(file.path)"
						>
							Unstage file
						</NButton>
					</div>
				</div>
			</div>
		</div>

		<ConfirmDialog
			v-model:show="showDiscardConfirm"
			title="Discard all changes"
			message="This will run permanently discard all uncommitted changes. Are you sure?"
			@confirm="discardAllChanges"
		/>

		<!-- Commit form -->
		<div class="staging-panel__commit-form">
			<div class="staging-panel__commit-header">
				<span class="staging-panel__commit-label">Commit</span>
			</div>

			<n-input
				test-id="commit-summary-input"
				v-model:value="commitSummary"
				placeholder="Commit summary"
				size="small"
				class="staging-panel__summary-input"
			/>

			<n-input
				test-id="commit-description-input"
				v-model:value="commitDescription"
				type="textarea"
				placeholder="Description"
				size="small"
				:rows="3"
				class="staging-panel__description-input"
			/>
			<NButton
				test-id="commit-btn"
				class="staging-panel__commit-btn"
				type="success"
				size="large"
				secondary
				:disabled="!stagedFiles.length || !commitSummary.trim()"
				@click="handleCommit"
			>
				Commit
			</NButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {NButton, NInput} from 'naive-ui';
import {useWorkingTree} from '@/composables/useWorkingTree';
import {useBranches} from '@/composables/useBranches';
import {useGit} from '@/composables/useGit';
import {useContextMenu} from '@/composables/useContextMenu';
import FileStatus from '../FileStatus.vue';
import Icon from '../Icon.vue';
import ConfirmDialog from '../ConfirmDialog.vue';

const emit = defineEmits<{
	openDiff: [filePath: string]
}>();

const {status, loadStatus, stageFile, stageAll, unstageAll, unstageFile, discardAllChanges} = useWorkingTree();
const {currentBranch} = useBranches();
const {commit, readFile, activePath} = useGit();
const {contextMenuFile} = useContextMenu();
const showDiscardConfirm = ref(false);
const unstagedExpanded = ref(true);
const stagedExpanded = ref(true);
const commitSummary = ref('');
const commitDescription = ref('');

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

async function handleFileClick(filePath: string): Promise<void> {
	await readFile(filePath);
	emit('openDiff', filePath);
}

async function handleCommit(): Promise<void> {
	const message = commitDescription.value.trim()
		? `${commitSummary.value.trim()}\n\n${commitDescription.value.trim()}`
		: commitSummary.value.trim();
	await commit(message);
	commitSummary.value = '';
	commitDescription.value = '';
	await loadStatus();
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

	&__files {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	&__section {
		border-bottom: 1px solid #1e2228;
	}

	&__section-header {
		display: flex;
		justify-content: space-between;
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
		min-height: 250px;
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
		font-size: 15px;
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

	&__summary-input,
	&__description-input {
		width: 100%;
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
