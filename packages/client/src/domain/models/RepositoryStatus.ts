import type {IBranch} from './Branch';
import type {IWorkingTreeStatus} from './FileStatus';

export interface IRepositoryStatus {
	currentBranch: IBranch | null
	workingTree: IWorkingTreeStatus
	head: string | null
	isDetachedHead: boolean
	hasUncommittedChanges: boolean
}
