import {ref, readonly} from 'vue';
import {WebSocketClient} from '@/infrastructure/websocket/WebSocketClient';
import {SshTunnelClient} from '@/infrastructure/ssh/SshTunnelClient';
import type {ITransportClient} from '@/infrastructure/ITransportClient';
import {EConnectionStatus, ENetworkCommand, EServerType} from '@/domain';
import type {IProject} from '@/domain';
import {useConnectionStatus} from '@/composables/useConnectionStatus';

const client = ref<ITransportClient | null>(null);
const status = ref<EConnectionStatus>(EConnectionStatus.Idle);

export function useWebSocket() {
	async function connect(project: IProject): Promise<void> {
		useConnectionStatus().reset();
		client.value?.close();
		status.value = EConnectionStatus.Connecting;

		try {
			let newClient: ITransportClient;

			if (project.serverType === EServerType.SSH) {
				const t = new SshTunnelClient(
					project.server,
					project.port,
					project.sshUser ?? '',
					project.sshKeyPath,
				);
				await t.connect();
				newClient = t;
			}
			else {
				newClient = new WebSocketClient(`ws://${project.server}:${project.port}`);
			}

			client.value = newClient;
			status.value = EConnectionStatus.Connected;
		}
		catch (e) {
			status.value = EConnectionStatus.Disconnected;
			throw e;
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
