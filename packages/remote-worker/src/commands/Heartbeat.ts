import type {IWsMessage} from '../types';

export async function run(ws: {send: (msg: string) => void}, data: IWsMessage): Promise<void> {
	globalThis.__resetPing?.();
	ws.send(JSON.stringify({requestId: data.requestId, status: 'success'}));
}
