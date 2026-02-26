<template>
	<div
		class="commit-row"
		:class="{'commit-row--selected': isSelected}"
		:style="{height: ROW_HEIGHT + 'px'}"
		@click="emit('select')"
		@contextmenu.prevent="emit('contextmenu', $event)"
	>
		<!-- Author avatar -->
		<div class="commit-row__avatar" :style="{background: authorColor}">
			{{ authorInitial }}
		</div>

		<!-- Message -->
		<div class="commit-row__body">
			<span class="commit-row__message">{{ commit.subject }}</span>

			<div class="commit-row__refs" v-if="commit.references?.length">
				<span
					v-for="ref in commit.references"
					:key="ref.name"
					class="commit-row__ref"
					:class="`commit-row__ref--${ref.type}`"
				>
					{{ ref.name }}
				</span>
			</div>
		</div>

		<!-- Meta -->
		<div class="commit-row__meta">
			<span class="commit-row__date">{{ commit.authorDate }}</span>
			<span class="commit-row__hash">{{ commit.hashAbbr }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {ICommit} from '@/domain';

const ROW_HEIGHT = 28;

const AUTHOR_COLORS = [
	'#6f9ef8', '#f89b6f', '#6ff8a0', '#f86f6f',
	'#c46ff8', '#f8e56f', '#6feef8', '#f86fc4',
];

function hashAuthorColor(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = ((hash << 5) - hash) + seed.charCodeAt(i);
		hash |= 0;
	}
	return AUTHOR_COLORS[Math.abs(hash) % AUTHOR_COLORS.length]!;
}

const props = defineProps<{
	commit: ICommit
	isSelected?: boolean
}>();

const emit = defineEmits<{
	select: []
	contextmenu: [event: MouseEvent]
}>();

const authorColor = computed(() =>
	hashAuthorColor(props.commit.authorEmail || props.commit.authorName),
);

const authorInitial = computed(() =>
	props.commit.authorName?.charAt(0)?.toUpperCase() ?? '?',
);
</script>

<style scoped lang="scss">
.commit-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 10px 0 8px;
	cursor: pointer;
	transition: background-color 0.1s;
	border-bottom: 1px solid transparent;

	&:hover {
		background-color: rgba(255, 255, 255, 0.04);
	}

	&--selected {
		background-color: rgba(111, 158, 248, 0.12) !important;
		border-bottom-color: rgba(111, 158, 248, 0.08);
	}

	&__avatar {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		font-size: 9px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0d0f11;
	}

	&__body {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
		overflow: hidden;
	}

	&__message {
		font-size: 12.5px;
		color: #c9d1d9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&__refs {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	&__ref {
		font-size: 10px;
		padding: 1px 5px;
		border-radius: 3px;
		font-weight: 500;
		white-space: nowrap;

		&--branch {
			background: rgba(111, 158, 248, 0.2);
			color: #6f9ef8;
		}

		&--HEAD {
			background: rgba(32, 178, 170, 0.25);
			color: #20b2aa;
			font-weight: 700;
		}

		&--tag {
			background: rgba(248, 229, 111, 0.2);
			color: #f8e56f;
		}

		&--remote {
			background: rgba(166, 227, 161, 0.15);
			color: #a6e3a1;
		}

		&--stash {
			background: rgba(248, 159, 111, 0.2);
			color: #f89f6f;
		}
	}

	&__meta {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1px;
	}

	&__date {
		font-size: 11px;
		color: #4b5563;
		white-space: nowrap;
	}

	&__hash {
		font-size: 10px;
		color: #374151;
		font-family: monospace;
	}
}
</style>
