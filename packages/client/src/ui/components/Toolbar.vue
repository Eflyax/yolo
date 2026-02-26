<template>
<div class="toolbar">
	<span class="toolbar__branch-path">
		<span class="toolbar__project">ami-api-2</span>
		<span class="toolbar__sep">›</span>
		<span class="toolbar__branch">master</span>
	</span>

	<div class="toolbar__actions">
		<NButton
			v-for="action of actions"
			:key="action.label"
			class="toolbar__action-btn"
			:title="action.label"
			:disabled="action.disabled"
			quaternary
			size="small"
		>
			<div class="content">
				<p>{{ action.label }}</p>
				<Icon :name="action.icon" />
			</div>
		</NButton>
	</div>

	<div class="profile">
		<Icon name="mdi-account" />
	</div>
</div>
</template>

<script setup lang="ts">

import {NButton} from 'naive-ui';

const
	actions = [{
		icon: "mdi-arrow-down-bold",
		label: "Pull",
	}, {
		icon: "mdi-arrow-up-bold",
		label: "Push",
	}, {
		icon: "mdi-source-branch",
		label: "Branch",
	}, {
		icon: "mdi-archive-arrow-down-outline",
		label: "Stash",
		disabled: false
	}, {
		icon: "mdi-archive-arrow-up-outline",
		label: 'Pop',
		disabled: false,
	}];
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
		height: 45px;
		align-items: center;
		justify-content: center;
		gap: 10px;
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
