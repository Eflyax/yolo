<template>
	<div class="project-item">
		<div class="project-info">
			<span class="project-color-dot" :style="{background: project.color ?? '#6f9ef8'}" />
			<div>
				<div class="project-alias">{{ project.alias }}</div>
				<div class="project-path">{{ project.path }}</div>
			</div>
		</div>
		<div class="project-actions">
			<n-button size="small" type="success" @click="$emit('open')">
				<template #icon><Icon name="mdi-play" /></template>
			</n-button>
			<n-button size="small" type="info" @click="$emit('edit')">
				<template #icon><Icon name="mdi-pencil" /></template>
			</n-button>
			<n-button size="small" type="error" @click="$emit('delete')">
				<template #icon><Icon name="mdi-trash-can" /></template>
			</n-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type {IProject} from '@/domain';
import {NButton} from 'naive-ui';

const emit = defineEmits<{
	open: [project: IProject],
	edit: [project: IProject],
	delete: [project: IProject],
}>();

const props = defineProps<{
	project: IProject;
}>();
</script>
