import {ref, readonly} from 'vue';
import type {ITag} from '@/domain';
import {useGit} from './useGit';

const tags = ref<ITag[]>([]);

export function useTags() {
	const {callGit} = useGit();

	async function loadTags(): Promise<void> {
		const output = await callGit('tag', '--sort=-creatordate');

		tags.value = output
			.trim()
			.split('\n')
			.filter(Boolean)
			.map(name => ({name, hash: ''}));
	}

	return {
		tags: readonly(tags),
		loadTags,
	};
}
