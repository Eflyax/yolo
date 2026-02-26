export enum ENetworkCommand {
	GitCall = 'gitCall',
	WriteFile = 'writeFile',
	ReadFile = 'readFile',
	BrowseFiles = 'browseFiles',
	SshAgentInit = 'sshAgentInit',
}

export interface IWsMessage {
	requestId: string;
	command: string;
	[key: string]: unknown;
}
