<template>
	<div class="app-layout">
		<ProjectsSidebar />
		 <div class="repository">
			<Toolbar />

			<Splitpanes
				v-if="currentProject"
				class="layout-splitpanes"
			>
				<Pane :size="17" :min-size="12" :max-size="30" class="pane-sidebar">
					<Sidebar />
				</Pane>

				<Pane :size="59" :min-size="30" class="pane-center">
					<FileDiff
						v-if="activeDiffFile"
						:file-path="activeDiffFile"
						@close="activeDiffFile = null"
					/>
					<CommitHistory
						v-else
						@open-diff="activeDiffFile = $event"
					/>
				</Pane>

				<Pane :size="24" :min-size="18" :max-size="40" class="pane-right">
					<StagingPanel
						v-if="activeDiffFile"
						@open-diff="activeDiffFile = $event"
					/>
					<CommitDetails
						v-else
						@open-diff="activeDiffFile = $event"
					/>
				</Pane>
			</Splitpanes>
			<ProjectManager v-else />
		 </div>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {Splitpanes, Pane} from 'splitpanes';
import Sidebar from './Sidebar/Sidebar.vue';
import CommitHistory from './CommitHistory/CommitHistory.vue';
import CommitDetails from './CommitDetails/CommitDetails.vue';
import FileDiff from './FileDiff/FileDiff.vue';
import StagingPanel from './FileDiff/StagingPanel.vue';
import ProjectsSidebar from './ProjectsSidebar.vue';
import Toolbar from './Toolbar.vue';
import {useProject} from '@/composables/useProject';
import ProjectManager from './ProjectManager/ProjectManager.vue';

const activeDiffFile = ref<string | null>(null);
const {currentProject} = useProject();
</script>

<style scoped lang="scss">
.app-layout {
	display: flex;
	height: 100vh;
	overflow: hidden;
	background-color: #0d0f11;

	.repository {
		width: 100%;
	}
}

.layout-splitpanes {
	width: 100%;
	height: 100%;
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
