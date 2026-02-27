export interface IWsMessage {
	requestId: string;
	command: string;
	[key: string]: unknown;
}
