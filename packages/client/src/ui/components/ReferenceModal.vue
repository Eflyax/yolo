<template>
<NModal
	v-model:show="showModel"
	preset="card"
	:title="title"
	style="width: 420px;"
	:mask-closable="false"
	@after-enter="inputRef?.focus()"
>
	<NInput
		ref="inputRef"
		v-model:value="name"
		:placeholder="type === 'branch' ? 'Branch name' : 'Tag name'"
		@keydown.enter="confirm"
	/>

	<template #footer>
		<div class="modal-footer">
			<NButton @click="cancel">Cancel</NButton>
			<NButton
				type="primary"
				:disabled="!name.trim() || submitting"
				:loading="submitting"
				@click="confirm"
			>
				Confirm
			</NButton>
		</div>
	</template>
</NModal>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {NModal, NInput, NButton, useMessage} from 'naive-ui';
import {useBranches} from '@/composables/useBranches';
import {useGit} from '@/composables/useGit';

const props = defineProps<{
	show: boolean;
	type: 'branch' | 'tag';
	mode: 'create' | 'rename';
	commitHash?: string;
	initialName?: string;
}>();

const emit = defineEmits<{
	'update:show': [value: boolean];
	'done': [];
}>();

const message = useMessage();
const {createBranch, renameBranch} = useBranches();
const {createTag} = useGit();

const name = ref('');
const submitting = ref(false);
const inputRef = ref<InstanceType<typeof NInput> | null>(null);

const showModel = computed({
	get: () => props.show,
	set: (val) => emit('update:show', val),
});

const title = computed(() => {
	if (props.mode === 'rename') {
		return props.type === 'branch' ? 'Rename Branch' : 'Rename Tag';
	}
	return props.type === 'branch' ? 'New Branch' : 'New Tag';
});

watch(() => props.show, (val) => {
	if (val) {
		name.value = props.initialName ?? '';
	}
});

function cancel(): void {
	emit('update:show', false);
}

async function confirm(): Promise<void> {
	const trimmed = name.value.trim();
	if (!trimmed || submitting.value) return;

	submitting.value = true;

	try {
		if (props.mode === 'create') {
			if (props.type === 'branch') {
				const hash = props.commitHash && props.commitHash !== 'WORKING_TREE'
					? props.commitHash
					: undefined;
				await createBranch(trimmed, hash);
			}
			else {
				const hash = props.commitHash && props.commitHash !== 'WORKING_TREE'
					? props.commitHash
					: undefined;
				await createTag(trimmed, hash);
			}
		}
		else {
			if (props.type === 'branch') {
				await renameBranch(props.initialName ?? '', trimmed);
			}
		}

		emit('done');
		emit('update:show', false);
		name.value = '';
	}
	catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		message.error(msg);
	}
	finally {
		submitting.value = false;
	}
}
</script>

<style scoped>
.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>
