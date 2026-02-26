import {useWebSocket} from './useWebSocket';
import {useProject} from './useProject';
import {useLayout} from './useLayout';
import {ENetworkCommand} from '@/domain';
import {parseGitError} from '@/domain';

export function useGit() {
	const
		{call} = useWebSocket(),
		{currentProject} = useProject(),
		{setLoading} = useLayout();

	function repoPath(): string {
		if (!currentProject.value) {
			throw new Error('No project selected');
		}

		return currentProject.value.path;
	}

	async function callGit(...args: string[]): Promise<string> {
		setLoading(true);

		try {
			const result = await call(ENetworkCommand.GitCall, {
				repo_path: repoPath(),
				args,
			});

			return result as string;
		}
		catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			throw parseGitError(message, -1);
		}
		finally {
			setLoading(false);
		}
	}

	async function readFile(filePath: string, options: Record<string, unknown> = {}): Promise<string> {
		const result = await call(ENetworkCommand.ReadFile, {
			repo_path: repoPath(),
			file_path: filePath,
			options,
		});

		return result as string;
	}

	async function writeFile(filePath: string, content: string): Promise<void> {
		await call(ENetworkCommand.WriteFile, {
			repo_path: repoPath(),
			file_path: filePath,
			content,
		});
	}

	// ── Základní Git operace ───────────────────────────────────────────────────

	async function fetch(remote = '--all'): Promise<void> {
		await callGit('fetch', remote);
	}

	async function pull(remote = 'origin', branch?: string): Promise<void> {
		await callGit('pull', remote, ...(branch ? [branch] : []));
	}

	async function push(remote = 'origin', branch?: string, force = false): Promise<void> {
		await callGit(
			'push',
			remote,
			...(branch ? [branch] : []),
			...(force ? ['--force-with-lease'] : []),
		);
	}

	async function pushBranch(branchName: string, remote = 'origin'): Promise<void> {
		await callGit('push', '--set-upstream', remote, branchName);
	}

	// ── Checkout ───────────────────────────────────────────────────────────────

	async function checkout(ref: string): Promise<void> {
		await callGit('checkout', ref);
	}

	async function checkoutNewBranch(branchName: string, from?: string): Promise<void> {
		await callGit('checkout', '-b', branchName, ...(from ? [from] : []));
	}

	// ── Branch ────────────────────────────────────────────────────────────────

	async function deleteBranch(branchName: string, force = false): Promise<void> {
		await callGit('branch', force ? '-D' : '-d', branchName);
	}

	async function deleteRemoteBranch(branchName: string, remote = 'origin'): Promise<void> {
		await callGit('push', remote, '--delete', branchName);
	}

	async function renameBranch(oldName: string, newName: string): Promise<void> {
		await callGit('branch', '-m', oldName, newName);
	}

	// ── Staging ───────────────────────────────────────────────────────────────

	async function stageFile(filePath: string): Promise<void> {
		await callGit('add', '--', filePath);
	}

	async function stageAll(): Promise<void> {
		await callGit('add', '--all');
	}

	async function unstageFile(filePath: string): Promise<void> {
		await callGit('restore', '--staged', '--', filePath);
	}

	async function unstageAll(): Promise<void> {
		await callGit('restore', '--staged', '.');
	}

	async function discardFile(filePath: string): Promise<void> {
		await callGit('restore', '--', filePath);
	}

	// ── Commit ────────────────────────────────────────────────────────────────

	async function commit(message: string, options: {amend?: boolean} = {}): Promise<void> {
		await callGit(
			'commit',
			'-m', message,
			...(options.amend ? ['--amend'] : []),
		);
	}

	// ── Tag ───────────────────────────────────────────────────────────────────

	async function createTag(name: string, ref?: string, message?: string): Promise<void> {
		if (message) {
			await callGit('tag', '-a', name, ...(ref ? [ref] : []), '-m', message);
		}
		else {
			await callGit('tag', name, ...(ref ? [ref] : []));
		}
	}

	async function deleteTag(name: string): Promise<void> {
		await callGit('tag', '-d', name);
	}

	async function deleteRemoteTag(name: string, remote = 'origin'): Promise<void> {
		await callGit('push', remote, '--delete', `refs/tags/${name}`);
	}

	// ── Stash ─────────────────────────────────────────────────────────────────

	async function stashSave(message?: string): Promise<void> {
		await callGit('stash', 'push', ...(message ? ['-m', message] : []));
	}

	async function stashPop(stashId: string): Promise<void> {
		await callGit('stash', 'pop', stashId);
	}

	async function stashDrop(stashId: string): Promise<void> {
		await callGit('stash', 'drop', stashId);
	}

	// ── Reset ─────────────────────────────────────────────────────────────────

	async function resetSoft(ref: string): Promise<void> {
		await callGit('reset', '--soft', ref);
	}

	async function resetHard(ref: string): Promise<void> {
		await callGit('reset', '--hard', ref);
	}

	async function resetMixed(ref: string): Promise<void> {
		await callGit('reset', '--mixed', ref);
	}

	return {
		callGit,
		readFile,
		writeFile,
		fetch,
		pull,
		push,
		pushBranch,
		checkout,
		checkoutNewBranch,
		deleteBranch,
		deleteRemoteBranch,
		renameBranch,
		stageFile,
		stageAll,
		unstageFile,
		unstageAll,
		discardFile,
		commit,
		createTag,
		deleteTag,
		deleteRemoteTag,
		stashSave,
		stashPop,
		stashDrop,
		resetSoft,
		resetHard,
		resetMixed,
	};
}
