export interface IProject {
	id: string
	order: number
	alias: string
	path: string
	server: string
	port: number
	dateCreated: number
	dateLastOpen: number
	sshPrivateKey?: string
	color?: string
	groupId?: string
}

export interface IProjectGroup {
	id: string
	name: string
	color?: string
}
