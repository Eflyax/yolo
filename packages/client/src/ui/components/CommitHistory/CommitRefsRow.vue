<template>
	<div class="commit-refs-row" :style="{height: ROW_HEIGHT + 'px'}">
		<!-- Horizontal connector line -->
		<svg
			v-if="displayRefs.length > 0 && !commit.isStash"
			class="row-line-svg"
			width="100%"
			:height="ROW_HEIGHT"
		>
			<line
				class="horizontal-line"
				:x1="PADDING_LEFT"
				:y1="LINE_Y"
				x2="100%"
				:y2="LINE_Y"
				:stroke="lineColor"
				:stroke-width="isHead ? LINE_WIDTH_THICK : LINE_WIDTH_THIN"
			/>
		</svg>

		<div
			v-if="displayRefs.length > 0"
			class="tags-wrapper"
			:class="{'tags-wrapper--expanded': expanded}"
			@mouseenter="expanded = true"
			@mouseleave="expanded = false"
		>
			<div
				v-for="ref in shownRefs"
				:key="ref.id"
				class="ref-tag"
				:style="{backgroundColor: tagColor}"
				:title="ref.name"
			>
				<Icon :name="getRefIcon(ref.type)" class="ref-icon" />
				<span class="ref-name">{{ ref.name }}</span>
			</div>

			<div
				v-if="!expanded && overflowCount > 0"
				class="ref-tag ref-tag--overflow"
				:style="{backgroundColor: tagColor}"
				:title="`${overflowCount} more`"
			>
				<span class="ref-name">+{{ overflowCount }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import type {ICommit} from '@/domain';
import {EReferenceType} from '@/domain';
import Icon from '@/ui/components/Icon.vue';
import {getGraphColor} from './graphColors';

const ROW_HEIGHT = 28;
const LINE_Y = 9;
const PADDING_LEFT = 12;
const LINE_WIDTH_THICK = 6;
const LINE_WIDTH_THIN = 1.5;

const props = defineProps<{
	commit: ICommit;
}>();

const expanded = ref(false);

// Filter out stash and HEAD type refs (HEAD is encoded in isHead flag)
const displayRefs = computed(() =>
	(props.commit.references ?? []).filter(
		r => r.type !== EReferenceType.Stash && r.type !== EReferenceType.Head,
	),
);

// Whether this commit is the current HEAD (has a HEAD reference)
const isHead = computed(() =>
	(props.commit.references ?? []).some(r => r.type === EReferenceType.Head),
);

const lineColor = computed(() => getGraphColor(props.commit.level ?? 0));
const tagColor = computed(() => getGraphColor(props.commit.level ?? 0));

// Show only first ref when collapsed, all when expanded
const shownRefs = computed(() =>
	expanded.value ? displayRefs.value : displayRefs.value.slice(0, 1),
);

// Number of hidden refs (not counting the first one shown)
const overflowCount = computed(() => displayRefs.value.length - 1);

function getRefIcon(type: EReferenceType): string {
	switch (type) {
		case EReferenceType.Branch: return 'mdi-source-branch';
		case EReferenceType.RemoteBranch: return 'mdi-cloud-outline';
		case EReferenceType.Tag: return 'mdi-tag-outline';
		default: return 'mdi-label-outline';
	}
}
</script>

<style scoped lang="scss">
.commit-refs-row {
	position: relative;
	overflow: hidden;
}

.row-line-svg {
	position: absolute;
	top: 0;
	left: 0;
	pointer-events: none;
	width: 100%;
}

.tags-wrapper {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	gap: 3px;
	padding: 0 6px;
	height: 100%;
	overflow: hidden;
	margin-top: -5px;

	&--expanded {
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		overflow: visible;
		background: #0d0f11;
		z-index: 10;
	}
}

.ref-tag {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 1px 5px;
	border-radius: 3px;
	font-size: 10.5px;
	font-weight: 600;
	color: #0d0f11;
	white-space: nowrap;
	flex-shrink: 0;
	cursor: default;
	opacity: 0.9;

	&--overflow {
		opacity: 0.65;
		box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.55);
		color: #fff;
	}
}

.ref-icon {
	width: 10px;
	height: 10px;
	flex-shrink: 0;
}

.ref-name {
	max-width: 120px;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
