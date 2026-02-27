import {ref, readonly} from 'vue';
import type {ITag} from '@/domain';
import {useGit} from './useGit';

const tags = ref<ITag[]>([]);
const remoteTags = ref<string[]>([]);

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

	async function loadRemoteTags(remote = 'origin'): Promise<void> {
		try {
			const output = await callGit('ls-remote', '--tags', remote);

			remoteTags.value = output
				.trim()
				.split('\n')
				.filter(Boolean)
				.map(line => {
					// format: "<hash>\trefs/tags/<name>"
					const ref = line.split('\t')[1] ?? '';

					return ref.replace('refs/tags/', '');
				})
				// skip dereferenced tag objects (^{})
				.filter(name => !name.endsWith('^{}'));
		}
		catch {
			remoteTags.value = [];
		}
	}

	return {
		tags: readonly(tags),
		remoteTags: readonly(remoteTags),
		loadTags,
		loadRemoteTags,
	};
}
