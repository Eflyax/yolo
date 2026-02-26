export interface IBranch {
	name: string
	hash: string
	isRemote: boolean
	isCurrent?: boolean
	upstream?: string
	ahead?: number
	behind?: number
}
