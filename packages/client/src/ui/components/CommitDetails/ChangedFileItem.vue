<template>
	<div
		class="changed-file"
		:class="`changed-file--${status}`"
		@click="emit('open')"
	>
		<FileStatus :status="status" />
		<span class="changed-file__path">
			<span class="changed-file__dir">{{ fileDir }}</span>
			<span class="changed-file__name">{{ fileName }}</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import FileStatus from '../FileStatus.vue';
import {computed} from 'vue';
import {EFileStatus} from '@/domain/enums';

const props = defineProps<{
	path: string
	status: EFileStatus
}>();

const emit = defineEmits<{
	open: []
}>();

const parts = computed(() => {
	const idx = props.path.lastIndexOf('/');

	return idx >= 0
		? {dir: props.path.slice(0, idx + 1), name: props.path.slice(idx + 1)}
		: {dir: '', name: props.path};
});

const fileDir = computed(() => parts.value.dir);
const fileName = computed(() => parts.value.name);
</script>

<style scoped lang="scss">
.changed-file {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 4px 12px;
	cursor: pointer;
	border-radius: 3px;
	font-size: 12px;

	&:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	&__path {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__dir {
		color: #4b5563;
		font-size: 11.5px;
	}

	&__name {
		color: #c9d1d9;
		font-size: 12px;
	}
}
</style>
