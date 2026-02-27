<template>
	<div class="projects-sidebar">
		<!-- Open project manager -->
		<n-tooltip placement="right" :delay="600">
			<template #trigger>
				<n-button
					test-id="open-repo-manager-btn"
					class="open-repo-manager"
					title="Manage repositories"
					:type="!currentProject ? 'info' : 'default'"
					secondary
					@click="showManager = true"
				>
					<Icon name="mdi-source-repository" />
				</n-button>
			</template>
			Manage repositories
		</n-tooltip>

		<!-- Divider -->
		<div v-if="projects.length" class="divider" />

		<!-- Project list -->
		<div class="project-list">
			<n-tooltip
				v-for="project in projects"
				:key="project.id"
				placement="right"
				:delay="400"
			>
				<template #trigger>
					<button
						test-id="project-btn"
						class="project-btn"
						:class="{'project-btn--active': currentProject?.id === project.id}"
						:style="{'--project-color': project.color ?? '#6f9ef8'}"
						@click="openProject(project)"
					>
						{{ initials(project.alias) }}
					</button>
				</template>
				{{ project.alias }}<br />
				<span style="opacity: 0.6; font-size: 0.85em;">{{ project.path }}</span>
			</n-tooltip>
		</div>

		<!-- Project Manager modal -->
		<n-modal
			v-model:show="showManager"
			preset="card"
			title="Repositories"
			style="width: 720px;"
		>
			<ProjectManager @project-opened="showManager = false" />
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {NButton, NModal, NTooltip} from 'naive-ui';
import {useProject} from '@/composables/useProject';
import Icon from './Icon.vue';
import ProjectManager from './ProjectManager/ProjectManager.vue';

const {projects, currentProject, openProject} = useProject();
const showManager = ref(false);

function initials(alias: string): string {
	const words = alias.trim().split(/\s+/);
	if (words.length >= 2) {
		return (words[0]![0]! + words[1]![0]!).toUpperCase();
	}
	return alias.slice(0, 2).toUpperCase();
}

</script>

<style scoped>
.projects-sidebar {
	width: 50px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 4px 0;
	background: #202327;
	flex-shrink: 0;
}

.open-repo-manager {
	width: 50px;
	height: 50px;
	flex-shrink: 0;

	svg {
		width: 22px;
		height: 22px;
	}
}

.divider {
	width: 28px;
	height: 1px;
	background: #2e333b;
	margin: 2px 0;
}

.project-list {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	width: 100%;
	padding: 0 4px;
}

.project-btn {
	width: 42px;
	height: 42px;
	border-radius: 10px;
	border: 2px solid transparent;
	background: #2a2e35;
	color: var(--project-color, #6f9ef8);
	font-size: 0.72em;
	font-weight: 700;
	letter-spacing: 0.02em;
	cursor: pointer;
	transition: border-radius 0.18s, border-color 0.15s, background 0.15s;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		border-radius: 14px;
		background: #32373f;
	}

	&--active {
		border-radius: 14px;
		border-color: var(--project-color, #6f9ef8);
		background: color-mix(in srgb, var(--project-color, #6f9ef8) 15%, #202327);
	}
}
</style>
