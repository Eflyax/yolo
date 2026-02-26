import type {IReference} from './Reference';

export interface ICommit {
	hash: string
	hashAbbr: string
	parents: Array<string>
	subject: string
	body: string
	authorEmail: string
	authorName: string
	authorDate: string
	committerEmail: string
	committerName: string
	committerDate: string
	index?: number
	level?: number
	references?: Array<IReference>
	isStash?: boolean
}
