<template>
	<div class="file-diff">
		<!-- Top bar -->
		<div class="file-diff__topbar">
			<div class="file-diff__breadcrumb">
				<span
					v-for="(part, i) in pathParts"
					:key="i"
					class="file-diff__breadcrumb-part"
				>
					<span
						class="file-diff__breadcrumb-segment"
						:class="{'file-diff__breadcrumb-segment--file': i === pathParts.length - 1}"
					>{{ part }}</span>
					<span v-if="i < pathParts.length - 1" class="file-diff__breadcrumb-sep">/</span>
				</span>
			</div>

			<div class="file-diff__tabs">
				<button
					v-for="tab in tabs"
					:key="tab.key"
					:test-id="`file-diff-tab-${tab.key}`"
					class="file-diff__tab"
					:class="{'file-diff__tab--active': activeTab === tab.key}"
					@click="activeTab = tab.key"
				>
					{{ tab.label }}
				</button>
			</div>

			<div class="file-diff__actions">
				<button test-id="toggle-line-numbers-btn" class="file-diff__action-btn" title="Line numbers">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
						<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
					</svg>
				</button>
				<button test-id="toggle-history-btn" class="file-diff__action-btn" title="History">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
						<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
					</svg>
				</button>

				<button test-id="stage-file-btn" class="file-diff__action-btn file-diff__action-btn--primary" @click="emit('close')">
					Stage File
				</button>

				<button test-id="close-file-diff-btn" class="file-diff__action-btn" title="Close" @click="emit('close')">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Monaco diff editor -->
		<div class="file-diff__editor">
			<vue-monaco-diff-editor
				:original="mockOriginal"
				:modified="mockModified"
				language="typescript"
				theme="vs-dark"
				:options="editorOptions"
				class="file-diff__monaco"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {VueMonacoDiffEditor} from '@guolao/vue-monaco-editor';

const props = defineProps<{
	filePath: string
}>();

const emit = defineEmits<{
	close: []
}>();

type TabKey = 'unstaged' | 'fileDiff' | 'gitDiff';

const activeTab = ref<TabKey>('fileDiff');

const tabs: {key: TabKey; label: string}[] = [
	{key: 'unstaged', label: 'Unstaged'},
	{key: 'fileDiff', label: 'File Diff'},
	{key: 'gitDiff', label: 'Git Diff'},
];

const pathParts = computed(() => props.filePath.split('/'));

const editorOptions = {
	renderSideBySide: true,
	readOnly: false,
	scrollBeyondLastLine: false,
	minimap: {enabled: false},
	fontSize: 12,
	lineHeight: 20,
	fontFamily: '"JetBrains Mono", "Fira Code", monospace',
	renderLineHighlight: 'none' as const,
	'bracketPairColorization.enabled': false,
	glyphMargin: true,
	renderMarginRevertIcon: false,
};

// Mock content – will be replaced by real data in Phase 5
const mockOriginal = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`;

const mockModified = `import { defineConfig } from 'vite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

const currentDir = dirname(fileURLToPath(new URL(import.meta.url)))
const srcDir = join(currentDir, 'src')

export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': srcDir,
    },
    dedupe: ['vue', 'naive-ui'],
  },
  build: {
    target: 'es2022',
  },
})`;
</script>

<style scoped lang="scss">
.file-diff {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background-color: #0d0f11;

	&__topbar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		height: 36px;
		border-bottom: 1px solid #1e2228;
		background-color: #111318;
		flex-shrink: 0;
		overflow: hidden;
	}

	&__breadcrumb {
		display: flex;
		align-items: center;
		overflow: hidden;
		font-size: 11.5px;
		flex-shrink: 1;
		min-width: 0;
	}

	&__breadcrumb-part {
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	&__breadcrumb-segment {
		color: #6b7280;

		&--file {
			color: #e5e7eb;
			font-weight: 500;
		}
	}

	&__breadcrumb-sep {
		color: #374151;
		margin: 0 2px;
	}

	&__tabs {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	&__tab {
		padding: 3px 10px;
		border: none;
		border-radius: 4px;
		font-size: 11.5px;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.1s;

		&:hover {
			color: #c9d1d9;
			background: rgba(255, 255, 255, 0.05);
		}

		&--active {
			background: rgba(111, 158, 248, 0.15);
			color: #6f9ef8;
			font-weight: 500;
		}
	}

	&__actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	&__action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 26px;
		height: 26px;
		padding: 0 6px;
		border: none;
		background: transparent;
		color: #6b7280;
		border-radius: 4px;
		cursor: pointer;
		font-size: 11.5px;
		transition: all 0.1s;

		&:hover {
			background-color: rgba(255, 255, 255, 0.06);
			color: #d1d5db;
		}

		&--primary {
			background: #6f9ef8;
			color: #0d0f11;
			font-weight: 700;
			font-size: 12px;
			padding: 0 12px;

			&:hover {
				background: #8fb4ff;
				color: #0d0f11;
			}
		}
	}

	&__editor {
		flex: 1;
		overflow: hidden;
	}

	&__monaco {
		width: 100%;
		height: 100%;
		min-height: 200px;
	}
}
</style>
