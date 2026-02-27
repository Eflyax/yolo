export interface ITransportClient {
	call(command: string, payload: Record<string, unknown>): Promise<unknown>
	close(): void
}
