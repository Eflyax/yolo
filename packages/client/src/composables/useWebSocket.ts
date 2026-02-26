import {ref, readonly} from 'vue';
import {WebSocketClient} from '@/infrastructure/websocket/WebSocketClient';
import {EConnectionStatus, ENetworkCommand} from '@/domain';

const client = ref<WebSocketClient | null>(null);
const status = ref<EConnectionStatus>(EConnectionStatus.Idle);

export function useWebSocket() {
	function connect(url: string): void {
		if (client.value) {
			client.value.close();
		}

		status.value = EConnectionStatus.Connecting;

		try {
			client.value = new WebSocketClient(url);
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
			return Promise.reject(new Error('WebSocket not connected'));
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
