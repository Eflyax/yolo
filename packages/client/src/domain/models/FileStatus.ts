import type {EFileStatus, EFileArea} from '../enums';

export interface IFileStatus {
	status: EFileStatus
	path: string
	oldPath?: string
	area: EFileArea
}

export interface IWorkingTreeStatus {
	staged: Array<IFileStatus>
	unstaged: Array<IFileStatus>
}
