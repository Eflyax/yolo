<template>
	<div class="app-layout">
		<ProjectsSidebar />
		 <div class="repository">
			<Toolbar />

			<Splitpanes
				v-if="currentProject"
				class="layout-splitpanes"
			>
				<Pane
					:size="sidebarCollapsed ? 2 : 17"
					:min-size="sidebarCollapsed ? 2 : 12"
					:max-size="sidebarCollapsed ? 2 : 30"
					class="pane-sidebar"
				>
					<Sidebar />
				</Pane>

				<Pane
					:size="sidebarCollapsed ? 75 : 60"
					:min-size="30"
					class="pane-center"
				>
					<FileDiff
						v-if="activePath"
						@close="handleClose"
					/>
					<CommitHistory
						v-else
						@open-diff="openFileDiff($event)"
					/>
				</Pane>

				<Pane :size="24" :min-size="18" :max-size="40" class="pane-right">
					<StagingPanel
						v-if="isWorkingTreeSelected"
						@open-diff="openFileDiff($event)"
					/>
					<CommitDetails
						v-else
						@open-diff="openFileDiff($event)"
					/>
				</Pane>
			</Splitpanes>
			<ProjectManager v-else />
		 </div>
	</div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {Splitpanes, Pane} from 'splitpanes';
import Sidebar from './Sidebar/Sidebar.vue';
import CommitHistory from './CommitHistory/CommitHistory.vue';
import CommitDetails from './CommitDetails/CommitDetails.vue';
import FileDiff from './FileDiff/FileDiff.vue';
import StagingPanel from './FileDiff/StagingPanel.vue';
import ProjectsSidebar from './ProjectsSidebar.vue';
import Toolbar from './Toolbar.vue';
import {useProject} from '@/composables/useProject';
import {useCommits} from '@/composables/useCommits';
import {useLayout} from '@/composables/useLayout';
import {useGit} from '@/composables/useGit';
import ProjectManager from './ProjectManager/ProjectManager.vue';

const {openFileDiff, closeFileDiff, sidebarCollapsed} = useLayout();
const {activePath} = useGit();

function handleClose(): void {
	activePath.value = null;
	closeFileDiff();
}
const {currentProject, openLastOpenProject} = useProject();
const {selectedHashes, selectCommit} = useCommits();

const isWorkingTreeSelected = computed(() => selectedHashes.value[0] === 'WORKING_TREE' || !selectedHashes.value);

if (!selectedHashes.value.length) {
	selectCommit('WORKING_TREE');
}

onMounted(() => {
	openLastOpenProject();
});

</script>

<style scoped lang="scss">
.app-layout {
	display: flex;
	height: 100vh;
	overflow: hidden;
	background-color: #0d0f11;

	.repository {
		width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
}

.layout-splitpanes {
	width: 100%;
	flex: 1;
	min-height: 0;
}

.pane-sidebar {
	background-color: #111318;
	border-right: 1px solid #1e2228;
	overflow: hidden;
}

.pane-center {
	background-color: #0d0f11;
	overflow: hidden;
}

.pane-right {
	background-color: #111318;
	border-left: 1px solid #1e2228;
	overflow: hidden;
}

.project-manager {
	margin: 10px auto;
}
</style>
