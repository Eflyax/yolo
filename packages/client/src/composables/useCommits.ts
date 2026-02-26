import {ref, computed, readonly} from 'vue';
import type {ICommit, IReference} from '@/domain';
import {EReferenceType} from '@/domain';
import {useGit} from './useGit';

const FIELD_SEP = '\x06';
const COMMIT_LIMIT = 200;
const LIMIT_MULTIPLIER = 4;

const LOG_FORMAT = [
	'%H',  // hash
	'%P',  // parents
	'%s',  // subject
	'%b',  // body
	'%ae', // authorEmail
	'%an', // authorName
	'%ad', // authorDate
	'%ce', // committerEmail
	'%cn', // committerName
	'%cd', // committerDate
].join(FIELD_SEP);

const LOG_KEYS: (keyof ICommit)[] = [
	'hash', 'parents', 'subject', 'body',
	'authorEmail', 'authorName', 'authorDate',
	'committerEmail', 'committerName', 'committerDate',
] as (keyof ICommit)[];

const commits = ref<ICommit[]>([]);
const selectedHashes = ref<string[]>([]);
const currentLimit = ref<number>(COMMIT_LIMIT);
const allLoaded = ref(false);
const referencesByHash = ref<Record<string, IReference[]>>({});

const commitMap = computed(() => {
	const map = new Map<string, ICommit>();

	commits.value.forEach(c => map.set(c.hash, c));

	return map;
});

function parseRawCommit(raw: string): Partial<ICommit> {
	const fields = raw.split(FIELD_SEP);
	const result: Partial<ICommit> = {};

	LOG_KEYS.forEach((key, i) => {
		(result as Record<string, unknown>)[key] = fields[i] ?? '';
	});

	return result;
}

function buildGraph(rawCommits: ICommit[]): void {
	const occupiedLevels: Record<number, ICommit> = {};
	const remainingParents: Record<string, Set<string>> = {};
	const children: Record<string, ICommit[]> = {};

	for (const [i, commit] of rawCommits.entries()) {
		commit.index = i;
		commit.hashAbbr = commit.hash.slice(0, 7);

		const parents = (commit.parents as unknown as string)
			? (commit.parents as unknown as string).split(' ').filter(Boolean)
			: [];

		commit.parents = parents;
		commit.references = referencesByHash.value[commit.hash] ?? [];

		for (const parentHash of parents) {
			children[parentHash] ??= [];
			children[parentHash].push(commit);
		}

		remainingParents[commit.hash] = new Set(parents);

		const sortedChildren = (children[commit.hash] ?? []).sort(
			(a, b) => (a.level ?? 0) - (b.level ?? 0),
		);

		for (const child of sortedChildren) {
			if (
				occupiedLevels[child.level ?? -1] === child &&
				commit.hash === child.parents[0] &&
				(child.index ?? 0) < i
			) {
				commit.level = child.level;
				break;
			}
		}

		if (commit.level === undefined) {
			for (let level = 0; ; ++level) {
				if (occupiedLevels[level] === undefined) {
					commit.level = level;
					break;
				}
			}
		}

		if (parents.length > 0) {
			occupiedLevels[commit.level] = commit;
		}

		for (const child of children[commit.hash] ?? []) {
			remainingParents[child.hash].delete(commit.hash);

			if (remainingParents[child.hash].size === 0 && child.level !== commit.level) {
				delete occupiedLevels[child.level ?? -1];
			}
		}
	}
}

function parseReferences(refOutput: string): Record<string, IReference[]> {
	const result: Record<string, IReference[]> = {};

	for (const line of refOutput.trim().split('\n').filter(Boolean)) {
		const [hash, refName] = line.split(' ');

		if (!hash || !refName) continue;

		result[hash] ??= [];

		let type: EReferenceType;
		let name: string;

		if (refName.startsWith('refs/heads/')) {
			type = EReferenceType.Branch;
			name = refName.replace('refs/heads/', '');
		}
		else if (refName.startsWith('refs/remotes/')) {
			type = EReferenceType.RemoteBranch;
			name = refName.replace('refs/remotes/', '');
		}
		else if (refName.startsWith('refs/tags/')) {
			type = EReferenceType.Tag;
			name = refName.replace('refs/tags/', '');
		}
		else {
			type = EReferenceType.Head;
			name = refName;
		}

		result[hash].push({type, name, id: refName, hash});
	}

	return result;
}

export function useCommits() {
	const {callGit} = useGit();

	async function loadReferences(): Promise<void> {
		const output = await callGit(
			'for-each-ref',
			'--format=%(objectname) %(refname)',
			'refs/heads',
			'refs/remotes',
			'refs/tags',
		);

		referencesByHash.value = parseReferences(output);
	}

	async function loadCommits(limit = COMMIT_LIMIT): Promise<void> {
		await loadReferences();

		const log = await callGit(
			'log',
			'--all',
			'-z',
			`--pretty=format:${LOG_FORMAT}`,
			'--date=format-local:%Y-%m-%d %H:%M',
			...(limit > 0 ? [`--max-count=${limit}`] : []),
			'--date-order',
		);

		const rawCommits = log
			.split('\0')
			.filter(Boolean)
			.map(row => parseRawCommit(row) as ICommit);

		buildGraph(rawCommits);

		commits.value = rawCommits;
		currentLimit.value = limit;
		allLoaded.value = rawCommits.length < limit;

		selectedHashes.value = selectedHashes.value.filter(
			h => commitMap.value.has(h),
		);
	}

	async function loadMore(): Promise<void> {
		const nextLimit = currentLimit.value * LIMIT_MULTIPLIER;

		await loadCommits(nextLimit);
	}

	function selectCommit(hash: string): void {
		selectedHashes.value = [hash];
	}

	function toggleCommitSelection(hash: string): void {
		const idx = selectedHashes.value.indexOf(hash);

		if (idx === -1) {
			selectedHashes.value.push(hash);
		}
		else {
			selectedHashes.value.splice(idx, 1);
		}
	}

	function clearSelection(): void {
		selectedHashes.value = [];
	}

	return {
		commits: readonly(commits),
		selectedHashes: readonly(selectedHashes),
		commitMap,
		allLoaded: readonly(allLoaded),
		loadCommits,
		loadMore,
		selectCommit,
		toggleCommitSelection,
		clearSelection,
	};
}
