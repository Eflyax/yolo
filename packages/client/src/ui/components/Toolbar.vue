<template>
<div class="toolbar">
	<span class="toolbar__branch-path">
		<template v-if="currentProject">
			<span class="toolbar__project">
				{{ currentProject.alias }}
			</span>
			<span class="toolbar__sep">›</span>
			<span class="toolbar__branch">{{ currentBranch?.name }}</span>
		</template>
	</span>

	<div class="toolbar__actions">
		<template v-if="currentProject">
			<NButton
				v-for="action of actions"
				:key="action.label"
				:test-id="`toolbar-${action.label.toLowerCase()}-btn`"
				class="toolbar__action-btn"
				:title="action.label"
				:disabled="action.disabled"
				secondary
				size="small"
				@click="action.onClick?.()"
			>
				<div class="content">
					<p>{{ action.label }}</p>
					<Icon :name="action.icon" />
				</div>
			</NButton>
		</template>
	</div>

	<div class="profile">
		<Icon name="mdi-account" />
	</div>

	<ReferenceModal
		v-model:show="showBranchModal"
		:type="EReferenceModalType.Branch"
		mode="create"
		:commit-hash="selectedHashes[0]"
		@done="loadCommits()"
	/>
</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {NButton, useMessage} from 'naive-ui';
import {useProject} from '@/composables/useProject';
import {useBranches} from '@/composables/useBranches';
import {useGit} from '@/composables/useGit';
import {useCommits} from '@/composables/useCommits';
import {useStash} from '@/composables/useStash';
import {useWorkingTree} from '@/composables/useWorkingTree';
import ReferenceModal from './ReferenceModal.vue';
import {EReferenceModalType} from '@/domain';

const
	{currentProject} = useProject(),
	{currentBranch, loadBranches} = useBranches(),
	{pull, push} = useGit(),
	{selectedHashes, loadCommits} = useCommits(),
	{stashes, stashSave, stashPop} = useStash(),
	{loadStatus} = useWorkingTree();

const message = useMessage();
const showBranchModal = ref(false);

async function handlePull(): Promise<void> {
	try {
		await pull();
		await Promise.all([loadCommits(), loadBranches()]);
	}
	catch (err: unknown) {
		message.error(err instanceof Error ? err.message : String(err));
	}
}

async function handlePush(): Promise<void> {
	try {
		await push();
	}
	catch (err: unknown) {
		message.error(err instanceof Error ? err.message : String(err));
	}
}

async function handleStash(): Promise<void> {
	try {
		await stashSave();
		await Promise.all([loadCommits(), loadStatus()]);
	}
	catch (err: unknown) {
		message.error(err instanceof Error ? err.message : String(err));
	}
}

async function handlePop(): Promise<void> {
	try {
		await stashPop('stash@{0}');
		await Promise.all([loadCommits(), loadStatus()]);
	}
	catch (err: unknown) {
		message.error(err instanceof Error ? err.message : String(err));
	}
}

const popDisabled = computed(() => stashes.value.length === 0);

const actions = computed(() => [{
	icon: "mdi-arrow-down-bold",
	label: "Pull",
	onClick: handlePull,
}, {
	icon: "mdi-arrow-up-bold",
	label: "Push",
	onClick: handlePush,
}, {
	icon: "mdi-source-branch",
	label: "Branch",
	onClick: () => { showBranchModal.value = true; },
}, {
	icon: "mdi-archive-arrow-down-outline",
	label: "Stash",
	disabled: false,
	onClick: handleStash,
}, {
	icon: "mdi-archive-arrow-up-outline",
	label: 'Pop',
	disabled: popDisabled.value,
	onClick: handlePop,
}]);
</script>

<style scoped lang="scss">
.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 10px;
	height: 50px;
	border-bottom: 1px solid #1e2228;
	flex-shrink: 0;
	background-color: #202327;

	.profile {
		width: 200px;
		height: 40px;
		text-align: right;
	}

	&__branch-path {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 14px;
		width: 450px;
	}

	&__project {
		color: #9ca3af;
		font-weight: 500;
	}

	&__sep {
		color: #fff;
		font-size: 14px;
	}

	&__branch {
		color: #e5e7eb;
		font-weight: 600;
	}

	&__actions {
		display: flex;
		width: 300px;
		align-items: center;
		justify-content: center;
		gap: 5px;

		.toolbar__action-btn {
			height: 48px;
			width: 48px;
			background-color: #202327;

			&:hover {
				box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.3);
			}
		}
	}

	&__action-btn {
		padding: 0 4px;
		color: #9ca3af;
		height: 40px;
		width: 40px;

		.content {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
			width: 100%;
			gap: 5px;

			p {
				font-size: 11px;
			}

			svg {
				height: 20px;
				width: 20px;
			}
		}

		&:hover {
			color: #fff;
		}
	}
}
</style>
