import {ref, readonly} from 'vue';
import type {IActivityLog} from '@/domain';

const MAX_LOGS = 500;
const logs = ref<IActivityLog[]>([]);

export function useActivityLog() {
	function addLog(entry: Omit<IActivityLog, 'id' | 'time'>): void {
		const time = new Date().toTimeString().slice(0, 8); // HH:mm:ss
		const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		logs.value.unshift({...entry, id, time});
		if (logs.value.length > MAX_LOGS) logs.value.length = MAX_LOGS;
	}

	function clearLogs(): void {
		logs.value = [];
	}

	return {logs: readonly(logs), addLog, clearLogs};
}
