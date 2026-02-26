<template>
	<n-card
		:title="isEdit ? 'Edit Project' : 'Add Project'"
		:bordered="false"
		size="huge"
		class="project-form"
	>
		<n-form label-placement="left" label-width="120">
			<n-form-item label="Alias">
				<n-input
					v-model:value="form.alias"
					placeholder="My project"
					:maxlength="40"
				/>
			</n-form-item>

			<n-form-item label="Location">
				<n-radio-group v-model:value="isLocal">
					<n-radio-button :value="true">
						<Icon name="mdi-laptop" />
						This PC
					</n-radio-button>
					<n-radio-button :value="false">
						<Icon name="mdi-server" />
						Remote server
					</n-radio-button>
				</n-radio-group>
			</n-form-item>

			<n-form-item v-if="!isLocal" label="Server">
				<n-input-group>
					<n-input
						v-model:value="form.server"
						placeholder="192.168.1.100"
						style="flex: 1;"
					/>
					<n-input-number
						v-model:value="form.port"
						placeholder="3000"
						:min="1"
						:max="65535"
						style="width: 120px;"
					/>
				</n-input-group>
			</n-form-item>

			<n-form-item label="Path">
				<n-input-group>
					<n-input
						:value="form.path"
						placeholder="/path/to/repo"
						:disabled="true"
						style="flex: 1;"
					/>
					<n-button
						type="info"
						ghost
						@click="showBrowser = true"
					>
						Browse…
					</n-button>
				</n-input-group>
			</n-form-item>

			<n-form-item label="SSH Private Key">
				<n-input
					v-model:value="form.sshPrivateKey"
					type="textarea"
					placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
					:autosize="{minRows: 3, maxRows: 8}"
					:input-props="{spellcheck: false, autocomplete: 'off'}"
				/>
			</n-form-item>

			<n-form-item label="Group">
				<n-select
					v-model:value="form.groupId"
					:options="groupOptions"
					placeholder="No group"
					clearable
				/>
			</n-form-item>

			<n-form-item label="Color">
				<div class="color-picker">
					<button
						v-for="color in PRESET_COLORS"
						:key="color"
						class="color-dot"
						:class="{'color-dot--active': form.color === color}"
						:style="{background: color}"
						@click="form.color = color"
					/>
				</div>
			</n-form-item>
		</n-form>

		<template #footer>
			<div class="form-actions">
				<n-button @click="emit('cancel')">Cancel</n-button>
				<n-button
					type="primary"
					:disabled="!form.alias || !form.path"
					@click="handleSave"
				>
					{{ isEdit ? 'Save Changes' : 'Add Project' }}
				</n-button>
			</div>
		</template>
	</n-card>

	<n-modal
		v-model:show="showBrowser"
		title="Select repository folder"
		preset="card"
		style="width: 720px;"
	>
		<FileBrowser
			:server="form.server"
			:port="form.port"
			:initial-path="form.path || '/'"
			@select="onPathSelected"
		/>
	</n-modal>
</template>

<script setup lang="ts">
import {ref, computed, reactive, watch} from 'vue';
import {
	NCard,
	NForm,
	NFormItem,
	NInput,
	NInputGroup,
	NInputNumber,
	NButton,
	NModal,
	NRadioGroup,
	NRadioButton,
	NSelect,
} from 'naive-ui';
import {useProject} from '@/composables/useProject';
import type {IProject} from '@/domain';
import Icon from '@/ui/components/Icon.vue';
import FileBrowser from './FileBrowser.vue';

const DEFAULT_PORT = 3000;

const PRESET_COLORS = [
	'#6f9ef8',
	'#f87171',
	'#4ade80',
	'#fb923c',
	'#a78bfa',
	'#34d399',
	'#fbbf24',
	'#f472b6',
] as const;

interface IFormData {
	alias: string;
	path: string;
	server: string;
	port: number;
	sshPrivateKey: string;
	groupId: string | null;
	color: string;
}

const props = defineProps<{
	project?: IProject | null;
}>();

const emit = defineEmits<{
	saved: [];
	cancel: [];
}>();

const {groups, addProject, updateProject} = useProject();
const showBrowser = ref(false);
const isEdit = computed(() => !!props.project?.id);

const isLocal = computed({
	get: () => form.server === 'localhost',
	set: (value: boolean) => {
		form.server = value ? 'localhost' : '';
		form.port = DEFAULT_PORT;
	},
});

const groupOptions = computed(() =>
	groups.value.map(g => ({label: g.name, value: g.id})),
);

function makeForm(project?: IProject | null): IFormData {
	return {
		alias: project?.alias ?? '',
		path: project?.path ?? '',
		server: project?.server ?? 'localhost',
		port: project?.port ?? DEFAULT_PORT,
		sshPrivateKey: project?.sshPrivateKey ?? '',
		groupId: project?.groupId ?? null,
		color: project?.color ?? PRESET_COLORS[0],
	};
}

const form = reactive<IFormData>(makeForm(props.project));

watch(() => props.project, (p) => {
	Object.assign(form, makeForm(p));
});

function onPathSelected(path: string): void {
	form.path = path;
	showBrowser.value = false;
}

function handleSave(): void {
	if (!form.alias || !form.path) return;

	const data = {
		alias: form.alias,
		path: form.path,
		server: form.server,
		port: form.port,
		sshPrivateKey: form.sshPrivateKey || undefined,
		groupId: form.groupId ?? undefined,
		color: form.color,
	};

	if (isEdit.value && props.project) {
		updateProject(props.project.id, data);
	}
	else {
		addProject(data);
	}

	emit('saved');
}
</script>

<style scoped>
.project-form {
	min-width: 560px;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.color-picker {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.color-dot {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	border: 2px solid transparent;
	cursor: pointer;
	transition: transform 0.15s, border-color 0.15s;

	&:hover {
		transform: scale(1.2);
	}

	&--active {
		border-color: #fff;
		transform: scale(1.15);
	}
}
</style>
