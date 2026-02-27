import {ref, readonly} from 'vue';
import {invoke} from '@tauri-apps/api/core';
import type {IActivityLog} from '@/domain';

const MAX_LOGS = 500;
const logs = ref<IActivityLog[]>([]);

export function useActivityLog() {
	function addLog(entry: Omit<IActivityLog, 'id' | 'time'>): void {
		const time = new Date().toTimeString().slice(0, 8); // HH:mm:ss
		const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const logEntry = {...entry, id, time};
		logs.value.unshift(logEntry);

		if (logs.value.length > MAX_LOGS) {
			logs.value.length = MAX_LOGS;
		}
		const prefix = entry.direction === 'request' ? '>' : '<';
		const line = `[${time}] ${prefix} [${entry.type}] [${entry.status}] ${entry.message}`;
		console.log(line);
		invoke('write_log', {msg: line}).catch(() => {});
	}

	function clearLogs(): void {
		logs.value = [];
	}

	return {logs: readonly(logs), addLog, clearLogs};
}
