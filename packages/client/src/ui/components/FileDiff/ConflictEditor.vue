<template>
	<div class="conflict-editor">
		<!-- Status bar -->
		<div class="conflict-editor__bar">
			<span class="conflict-editor__bar-label">Merge conflicts</span>
			<span class="conflict-editor__bar-count">
				{{ resolvedCount }} / {{ conflictCount }} resolved
			</span>
			<NButton
				size="tiny"
				:type="allResolved ? 'warning' : 'default'"
				:disabled="!allResolved"
				secondary
				@click="handleSave"
			>
				Save resolution
			</NButton>
		</div>

		<!-- Column headers -->
		<div class="conflict-editor__col-headers">
			<div class="conflict-editor__col-header">← HEAD (ours)</div>
			<div class="conflict-editor__col-header conflict-editor__col-header--theirs">Incoming changes (theirs)</div>
		</div>

		<!-- Scrollable content -->
		<div class="conflict-editor__body">
			<template v-for="(seg, si) in segments" :key="si">
				<!-- Context lines -->
				<template v-if="seg.type === 'context'">
					<div
						v-for="(line, li) in seg.lines"
						:key="li"
						class="conflict-editor__row"
					>
						<div class="conflict-editor__cell">
							<span class="conflict-editor__lineno">{{ leftLineNos[si]?.[li] }}</span>
							<span class="conflict-editor__code">{{ line }}&nbsp;</span>
						</div>
						<div class="conflict-editor__cell">
							<span class="conflict-editor__lineno">{{ rightLineNos[si]?.[li] }}</span>
							<span class="conflict-editor__code">{{ line }}&nbsp;</span>
						</div>
					</div>
				</template>

				<!-- Conflict block -->
				<template v-else>
					<!-- Accept buttons row -->
					<div class="conflict-editor__row conflict-editor__row--action">
						<div
							class="conflict-editor__cell conflict-editor__cell--action conflict-editor__cell--ours-action"
							:class="{'conflict-editor__cell--accepted': resolutions.get(seg.index) === 'ours'}"
						>
							<button class="conflict-editor__accept-btn" @click="resolve(seg.index, 'ours')">
								<Icon
									:name="resolutions.get(seg.index) === 'ours'
										? 'mdi-checkbox-marked-circle'
										: 'mdi-checkbox-blank-circle-outline'"
									class="conflict-editor__accept-icon"
								/>
								<span>Accept ours</span>
							</button>
						</div>
						<div
							class="conflict-editor__cell conflict-editor__cell--action conflict-editor__cell--theirs-action"
							:class="{'conflict-editor__cell--accepted': resolutions.get(seg.index) === 'theirs'}"
						>
							<button class="conflict-editor__accept-btn" @click="resolve(seg.index, 'theirs')">
								<Icon
									:name="resolutions.get(seg.index) === 'theirs'
										? 'mdi-checkbox-marked-circle'
										: 'mdi-checkbox-blank-circle-outline'"
									class="conflict-editor__accept-icon"
								/>
								<span>Accept theirs</span>
							</button>
						</div>
					</div>

					<!-- Conflict lines: pad shorter side with spacers -->
					<div
						v-for="ri in Math.max(seg.ours.length, seg.theirs.length, 1)"
						:key="ri"
						class="conflict-editor__row"
					>
						<!-- Ours -->
						<div
							class="conflict-editor__cell conflict-editor__cell--ours"
							:class="{
								'conflict-editor__cell--dim': resolutions.get(seg.index) === 'theirs',
								'conflict-editor__cell--chosen': resolutions.get(seg.index) === 'ours',
								'conflict-editor__cell--spacer': ri > seg.ours.length,
							}"
						>
							<span class="conflict-editor__lineno">
								{{ ri <= seg.ours.length ? leftLineNos[si]?.[ri - 1] : '' }}
							</span>
							<span class="conflict-editor__code">{{ seg.ours[ri - 1] ?? '' }}&nbsp;</span>
						</div>

						<!-- Theirs -->
						<div
							class="conflict-editor__cell conflict-editor__cell--theirs"
							:class="{
								'conflict-editor__cell--dim': resolutions.get(seg.index) === 'ours',
								'conflict-editor__cell--chosen': resolutions.get(seg.index) === 'theirs',
								'conflict-editor__cell--spacer': ri > seg.theirs.length,
							}"
						>
							<span class="conflict-editor__lineno">
								{{ ri <= seg.theirs.length ? rightLineNos[si]?.[ri - 1] : '' }}
							</span>
							<span class="conflict-editor__code">{{ seg.theirs[ri - 1] ?? '' }}&nbsp;</span>
						</div>
					</div>
				</template>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import {computed, reactive} from 'vue';
import {NButton} from 'naive-ui';
import Icon from '../Icon.vue';
import {parseConflicts, resolveConflicts} from './parseConflicts';
import type {ConflictBlock} from './parseConflicts';
import {useGit} from '@/composables/useGit';
import {useWorkingTree} from '@/composables/useWorkingTree';

const props = defineProps<{
	content: string;
	filePath: string;
}>();

const emit = defineEmits<{saved: []}>();

const {writeFile} = useGit();
const {stageFile} = useWorkingTree();

const segments = computed(() => parseConflicts(props.content));
const conflictCount = computed(() =>
	segments.value.filter((s): s is ConflictBlock => s.type === 'conflict').length,
);

const resolutions = reactive(new Map<number, 'ours' | 'theirs'>());
const resolvedCount = computed(() => resolutions.size);
const allResolved = computed(() => resolvedCount.value === conflictCount.value && conflictCount.value > 0);

function resolve(index: number, side: 'ours' | 'theirs'): void {
	if (resolutions.get(index) === side) {
		resolutions.delete(index);
	} else {
		resolutions.set(index, side);
	}
}

// Line numbers for the ours (left) pane: context + ours lines count sequentially
const leftLineNos = computed(() => {
	const result: number[][] = [];
	let n = 1;
	for (const seg of segments.value) {
		if (seg.type === 'context') {
			result.push(seg.lines.map(() => n++));
		} else {
			result.push(seg.ours.map(() => n++));
		}
	}
	return result;
});

// Line numbers for the theirs (right) pane: context + theirs lines count sequentially
const rightLineNos = computed(() => {
	const result: number[][] = [];
	let n = 1;
	for (const seg of segments.value) {
		if (seg.type === 'context') {
			result.push(seg.lines.map(() => n++));
		} else {
			result.push(seg.theirs.map(() => n++));
		}
	}
	return result;
});

async function handleSave(): Promise<void> {
	const resolved = resolveConflicts(segments.value, resolutions);
	await writeFile(props.filePath, resolved);
	await stageFile(props.filePath);
	emit('saved');
}
</script>

<style scoped lang="scss">
.conflict-editor {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background-color: $bg-app;
	font-family: "JetBrains Mono", "Fira Code", monospace;
	font-size: 12px;

	&__bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 12px;
		height: 36px;
		background-color: $bg-panel;
		border-bottom: 1px solid $border;
		flex-shrink: 0;
	}

	&__bar-label {
		font-size: 12px;
		font-weight: 600;
		color: $color-warning;
		font-family: inherit;
	}

	&__bar-count {
		font-size: 11.5px;
		color: $text-muted;
		font-family: inherit;
		flex: 1;
	}

	&__col-headers {
		display: flex;
		border-bottom: 1px solid $border;
		flex-shrink: 0;
	}

	&__col-header {
		flex: 1;
		padding: 4px 12px 4px 44px;
		font-size: 11px;
		color: $text-dim;
		background-color: $bg-panel;

		&--theirs {
			border-left: 1px solid $border;
		}
	}

	&__body {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	// ── Row ──────────────────────────────────────────────────────────────────

	&__row {
		display: flex;
		min-height: 20px;

		&--action {
			min-height: 26px;
		}
	}

	// ── Cell ─────────────────────────────────────────────────────────────────

	&__cell {
		flex: 1;
		display: flex;
		align-items: center;
		min-width: 0;
		line-height: 20px;

		// Divider between the two panes
		&:first-child {
			border-right: 1px solid $border;
		}

		// ── Conflict sides ──────────────────────────────────────────────────

		&--ours {
			background-color: rgba($color-blue, 0.14);

			&.conflict-editor__cell--chosen {
				background-color: rgba($color-blue, 0.28);
			}

			&.conflict-editor__cell--dim {
				background-color: rgba($color-blue, 0.05);
				opacity: 0.45;
			}

			&.conflict-editor__cell--spacer {
				background-color: rgba($color-blue, 0.06);
			}
		}

		&--theirs {
			background-color: rgba($project-amber, 0.14);

			&.conflict-editor__cell--chosen {
				background-color: rgba($project-amber, 0.28);
			}

			&.conflict-editor__cell--dim {
				background-color: rgba($project-amber, 0.05);
				opacity: 0.45;
			}

			&.conflict-editor__cell--spacer {
				background-color: rgba($project-amber, 0.06);
			}
		}

		// ── Action cells (accept buttons row) ──────────────────────────────

		&--action {
			align-items: center;
			padding: 3px 6px;
		}

		&--ours-action {
			background-color: rgba($color-blue, 0.2);
			border-top: 1px solid rgba($color-blue, 0.3);
			border-bottom: 1px solid rgba($color-blue, 0.3);

			&.conflict-editor__cell--accepted {
				background-color: rgba($color-blue, 0.35);
			}
		}

		&--theirs-action {
			background-color: rgba($project-amber, 0.2);
			border-top: 1px solid rgba($project-amber, 0.3);
			border-bottom: 1px solid rgba($project-amber, 0.3);

			&.conflict-editor__cell--accepted {
				background-color: rgba($project-amber, 0.35);
			}
		}
	}

	// ── Accept button ─────────────────────────────────────────────────────────

	&__accept-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		background: transparent;
		border: none;
		color: $text-muted;
		cursor: pointer;
		font-size: 11px;
		font-family: inherit;
		padding: 2px 4px;
		border-radius: 3px;

		&:hover {
			color: $text-primary;
			background: rgba($text-white, 0.06);
		}
	}

	&__accept-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	// ── Line content ─────────────────────────────────────────────────────────

	&__lineno {
		width: 36px;
		min-width: 36px;
		text-align: right;
		padding-right: 10px;
		color: $text-ghost;
		font-size: 11px;
		user-select: none;
		flex-shrink: 0;
	}

	&__code {
		color: $text-default;
		white-space: pre;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
