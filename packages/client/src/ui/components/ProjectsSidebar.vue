<template>
	<div class="projects-sidebar">
		<n-button
			title="Add new repository"
			type="info"
			secondary
			class="open-repo-manager"
		>
			<Icon name="mdi-folder" />
		</n-button>

		<div class="project-list">
			<n-button
				v-for="project in projects"
				:key="project.id"
			>
				{{ project.alias }}
			</n-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {NButton} from 'naive-ui';
import Icon from './Icon.vue';
import type {IProject} from '@/domain/models/Project';

const projects = ref<IProject[]>([]);
</script>

<style scoped>
.projects-sidebar {
	width: 50px;
	border-bottom: 1px solid #1e2228;
	flex-shrink: 0;
	background-color: #202327;

	.open-repo-manager {
		width: 50px;
		height: 50px;

		svg {
			width: 24px;
			height: 24px;
		}
	}
}
</style>
