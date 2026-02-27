import {ref, readonly} from 'vue';
import {WebSocketClient} from '@/infrastructure/websocket/WebSocketClient';
import {SshClient} from '@/infrastructure/ssh/SshClient';
import type {ITransportClient} from '@/infrastructure/ITransportClient';
import {EConnectionStatus, ENetworkCommand, EServerType} from '@/domain';
import type {IProject} from '@/domain';

const client = ref<ITransportClient | null>(null);
const status = ref<EConnectionStatus>(EConnectionStatus.Idle);

export function useWebSocket() {
	function connect(project: IProject): void {
		if (client.value) {
			client.value.close();
		}

		status.value = EConnectionStatus.Connecting;

		try {
			if (project.serverType === EServerType.SSH) {
				client.value = new SshClient(
					project.server,
					project.port,
					project.sshUser ?? '',
					project.sshKeyPath,
				);
			}
			else {
				client.value = new WebSocketClient(`ws://${project.server}:${project.port}`);
			}

			status.value = EConnectionStatus.Connected;
		}
		catch {
			status.value = EConnectionStatus.Disconnected;
		}
	}

	function disconnect(): void {
		client.value?.close();
		client.value = null;
		status.value = EConnectionStatus.Disconnected;
	}

	function call(command: ENetworkCommand, payload: Record<string, unknown>): Promise<unknown> {
		if (!client.value) {
			return Promise.reject(new Error('Not connected'));
		}

		return client.value.call(command, payload);
	}

	return {
		client: readonly(client),
		status: readonly(status),
		connect,
		disconnect,
		call,
	};
}
