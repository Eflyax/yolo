<template>
	<div
		test-id="branch-item-select"
		class="branch-item"
		:class="{
			'branch-item--active': isActive,
			'branch-item--remote': isRemote,
		}"
		@click="emit('select')"
	>
		<span class="branch-item__dot" :style="{background: color}" />
		<span class="branch-item__name">{{ displayName }}</span>
		<span v-if="isActive" class="branch-item__badge">HEAD</span>
	</div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
	name: string
	color: string
	isActive?: boolean
	isRemote?: boolean
}>();

const emit = defineEmits<{
	select: []
}>();

const displayName = computed(() => {
	if (props.isRemote) {
		return props.name.replace(/^origin\//, '');
	}

	return props.name;
});
</script>

<style scoped lang="scss">
.branch-item {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 3px 8px 3px 20px;
	cursor: pointer;
	border-radius: 3px;
	font-size: 12.5px;
	color: #9ca3af;
	white-space: nowrap;
	overflow: hidden;

	&:hover {
		background-color: rgba(255, 255, 255, 0.05);
		color: #d1d5db;
	}

	&--active {
		color: #e5e7eb;
		font-weight: 500;
	}

	&__dot {
		flex-shrink: 0;
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	&__name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&__badge {
		flex-shrink: 0;
		font-size: 10px;
		padding: 1px 5px;
		border-radius: 3px;
		background: rgba(111, 158, 248, 0.2);
		color: #6f9ef8;
		font-weight: 600;
		letter-spacing: 0.3px;
	}
}
</style>
