<template>
	<div class="sidebar">
		<!-- Search -->
		<div class="sidebar__search">
			<Icon
				:name="sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
				class="sidebar__collapse-btn"
				@click="toggle"
			/>
			<n-input
				v-if="!sidebarCollapsed"
				v-model:value="searchQuery"
				placeholder="Filter branches…"
				size="small"
				clearable
			>
				<template #prefix>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.5">
						<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z"/>
					</svg>
				</template>
			</n-input>
		</div>

		<!-- Branch list -->
		<div v-if="!sidebarCollapsed" class="sidebar__branches">
			<!-- LOCAL -->
			<div class="sidebar__section">
				<div
					class="sidebar__section-header"
					@click="localExpanded = !localExpanded"
				>
					<svg
						class="sidebar__chevron"
						:class="{'sidebar__chevron--open': localExpanded}"
						width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
					>
						<path d="M7 10l5 5 5-5z"/>
					</svg>
					<span>LOCAL</span>
					<span class="sidebar__section-count">{{ filteredLocalBranches.length }}</span>
				</div>

				<template v-if="localExpanded">
					<BranchItem
						v-for="branch in filteredLocalBranches"
						:key="branch.name"
						:name="branch.name"
						:color="branch.color"
						:is-active="branch.name === currentBranch"
						@select="currentBranch = branch.name"
					/>
				</template>
			</div>

			<!-- REMOTE -->
			<div class="sidebar__section">
				<div
					class="sidebar__section-header"
					@click="remoteExpanded = !remoteExpanded"
				>
					<svg
						class="sidebar__chevron"
						:class="{'sidebar__chevron--open': remoteExpanded}"
						width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
					>
						<path d="M7 10l5 5 5-5z"/>
					</svg>
					<span>REMOTE</span>
					<span class="sidebar__section-count">{{ filteredRemoteBranches.length }}</span>
				</div>

				<template v-if="remoteExpanded">
					<BranchItem
						v-for="branch in filteredRemoteBranches"
						:key="branch.name"
						:name="branch.name"
						:color="branch.color"
						:is-remote="true"
						@select="() => {}"
					/>
				</template>
			</div>
		</div>

		<!-- Footer -->
		<div v-if="!sidebarCollapsed" class="sidebar__footer">
			<span class="sidebar__stash-link">+ STASH</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {NButton, NInput} from 'naive-ui';
import BranchItem from './BranchItem.vue';
import {useLayout} from '@/composables/useLayout';

const {sidebarCollapsed, collapseSidebar, expandSidebar} = useLayout();

function toggle(): void {
	sidebarCollapsed.value ? expandSidebar() : collapseSidebar();
}

const COLORS = [
	'#6f9ef8', '#f89b6f', '#6ff8a0', '#f86f6f',
	'#c46ff8', '#f8e56f', '#6feef8', '#f86fc4',
];

interface Branch {
	name: string
	color: string
}

const currentBranch = ref('master');
const searchQuery = ref('');
const localExpanded = ref(true);
const remoteExpanded = ref(false);

const localBranches: Branch[] = [
	{name: 'master', color: COLORS[0]},
	{name: 'feature', color: COLORS[1]},
	{name: 'FOO-226', color: COLORS[2]},
	{name: 'FOO-231', color: COLORS[3]},
	{name: 'hotfix', color: COLORS[4]},
	{name: 'release/4.1.0', color: COLORS[5]},
	{name: 'release/4.2.0', color: COLORS[6]},
	{name: 'release/4.3.0', color: COLORS[7]},
	{name: 'SecurityUpdates', color: COLORS[0]},
];

const remoteBranches: Branch[] = [
	{name: 'origin/master', color: COLORS[0]},
	{name: 'origin/feature', color: COLORS[1]},
	{name: 'origin/FOO-226', color: COLORS[2]},
	{name: 'origin/release/4.1.0', color: COLORS[5]},
	{name: 'origin/release/4.2.0', color: COLORS[6]},
];

const filteredLocalBranches = computed(() => {
	const q = searchQuery.value.toLowerCase();

	return q ? localBranches.filter(b => b.name.toLowerCase().includes(q)) : localBranches;
});

const filteredRemoteBranches = computed(() => {
	const q = searchQuery.value.toLowerCase();

	return q ? remoteBranches.filter(b => b.name.toLowerCase().includes(q)) : remoteBranches;
});
</script>

<style scoped lang="scss">
.sidebar {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #111318;
	user-select: none;

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 10px 8px;
		border-bottom: 1px solid #1e2228;
		flex-shrink: 0;
	}

	&__project-name {
		font-size: 13px;
		font-weight: 600;
		color: #e5e7eb;
	}

	&__branch-badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		background-color: rgba(32, 178, 170, 0.2);
		color: #20b2aa;
		font-weight: 600;
		cursor: pointer;

		&:hover {
			background-color: rgba(32, 178, 170, 0.3);
		}
	}

	&__search {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 8px 4px;
		flex-shrink: 0;
	}

	&__collapse-btn {
		flex-shrink: 0;
		margin-left: auto;
		width: 24px;
		height: 24px;
		cursor: pointer;
	}

	&__branches {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
	}

	&__section {
		margin-bottom: 4px;
	}

	&__section-count {
		margin-left: auto;
		font-size: 10px;
		color: #4b5563;
	}

	&__chevron {
		transition: transform 0.15s ease;
		opacity: 0.6;

		&--open {
			transform: rotate(0deg);
		}

		&:not(&--open) {
			transform: rotate(-90deg);
		}
	}

	&__footer {
		padding: 8px 12px;
		border-top: 1px solid #1e2228;
		flex-shrink: 0;
	}

	&__stash-link {
		font-size: 11.5px;
		color: #4b5563;
		cursor: pointer;
		letter-spacing: 0.3px;

		&:hover {
			color: #9ca3af;
		}
	}
}
</style>
