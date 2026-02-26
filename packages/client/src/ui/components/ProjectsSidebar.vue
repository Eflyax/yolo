<template>
	<div class="projects-sidebar">
		<n-button
			title="Add new repository"
			type="info"
			secondary
			class="open-repo-manager"
		>
			<icon name="mdi-folder" />
		</n-button>

		<div class="project-list">
			<n-button
				v-for="project in projects"
			>
				{{ project.alias }}
			</n-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {NButton} from 'naive-ui';

const projects = ref([]);

</script>

<style scoped>
.projects-sidebar {
	width: 50xp;
	border-bottom: 1px solid #1e2228;
	flex-shrink: 0;
	background-color: #202327;

	.open-repo-manager {
		width: 50px;
		height: 50px;

		svg {
			width: 50px;
			height: 50px;
		}
	}
}

</style>
