import {ref} from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu';
import {useGit} from '@/composables/useGit';
import {useStash} from '@/composables/useStash';
import {useWorkingTree} from '@/composables/useWorkingTree';
import {useCommits} from '@/composables/useCommits';
import {useBranches} from '@/composables/useBranches';
import type {ICommit} from '@/domain';

const
	THEME = 'win10 dark';

const showReferenceModal = ref(false);
const referenceModalType = ref<'branch' | 'tag'>('branch');
const referenceModalCommitHash = ref<string | undefined>();

export function useContextMenu() {
	const
		{callGit} = useGit(),
		{loadStashes} = useStash(),
		{discardFile, loadStatus} = useWorkingTree(),
		{loadCommits} = useCommits(),
		{loadBranches} = useBranches();

	async function refreshAll(): Promise<void> {
		await Promise.all([loadCommits(), loadStashes(), loadStatus(), loadBranches()]);
	}

	function contextMenuCommit(argument: {e: MouseEvent; commit: ICommit}) {
		const
			{e, commit} = argument,
			items = [];

		if (commit.isStash) {
			const stashId = commit.references?.[0]?.id ?? commit.hash;

			const stashAction = async (action: string) => {
				await callGit('stash', action, stashId);
				await refreshAll();
			};

			items.push(
				{label: 'Apply stash', onClick: async () => stashAction('apply')},
				{label: 'Pop stash', onClick: async () => stashAction('pop')},
				{label: 'Delete stash', onClick: async () => stashAction('drop')},
			);
		}
		else {
			const resetAction = async (flag: string) => {
				await callGit('reset', flag, commit.hash);
				await refreshAll();
			};

			items.push(
				{
					label: 'Create tag here',
					onClick: () => {
						referenceModalType.value = 'tag';
						referenceModalCommitHash.value = commit.hash;
						showReferenceModal.value = true;
					},
				},
				{
					label: 'Create branch here',
					onClick: () => {
						referenceModalType.value = 'branch';
						referenceModalCommitHash.value = commit.hash;
						showReferenceModal.value = true;
					},
				},
				{
					label: 'Reset HEAD to this commit',
					children: [
						{label: 'Soft', onClick: async () => resetAction('--soft')},
						{label: 'Mixed', onClick: async () => resetAction('--mixed')},
						{label: 'Hard', onClick: async () => resetAction('--hard')},
					],
				},
			);
		}

		ContextMenu.showContextMenu({
			x: e.x,
			y: e.y,
			items,
			theme: THEME
		});
	}

	function contextMenuFile(e: MouseEvent, filePath: string) {
		ContextMenu.showContextMenu({
			x: e.x,
			y: e.y,
			theme: THEME,
			items: [
				{
					label: 'Delete file',
					onClick: async () => {
						await discardFile(filePath);
					},
				},
			],
		});
	}

	return {
		contextMenuCommit,
		contextMenuFile,
		showReferenceModal,
		referenceModalType,
		referenceModalCommitHash,
	};
}
