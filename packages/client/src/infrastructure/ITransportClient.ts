export interface ITransportClient {
	connect?(): Promise<void>
	call(command: string, payload: Record<string, unknown>): Promise<unknown>
	close(): void
}
