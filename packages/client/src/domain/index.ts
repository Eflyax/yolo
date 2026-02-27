// ── Enums ─────────────────────────────────────────────────────────────────────
export {
	EReferenceType,
	EFileStatus,
	EFileArea,
	ENetworkCommand,
	EGitErrorCode,
	EConnectionStatus,
	EReferenceModalType,
} from './enums';

// ── Models ────────────────────────────────────────────────────────────────────
export type {IProject, IProjectGroup} from './models/Project';
export type {IBranch} from './models/Branch';
export type {ICommit} from './models/Commit';
export type {ITag} from './models/Tag';
export type {IStash} from './models/Stash';
export type {IReference} from './models/Reference';
export type {IFileStatus, IWorkingTreeStatus} from './models/FileStatus';
export type {IRepositoryStatus} from './models/RepositoryStatus';

// ── Errors ────────────────────────────────────────────────────────────────────
export {GitError, parseGitError} from './errors/GitError';
