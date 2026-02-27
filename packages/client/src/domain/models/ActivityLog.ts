export interface IActivityLog {
	id: string
	type: 'git' | 'ssh'
	status: 'info' | 'success' | 'error'
	message: string
	time: string        // HH:mm:ss
	direction: 'request' | 'response'
}
