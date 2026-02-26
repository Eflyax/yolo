import {ref, readonly} from 'vue';

const loading = ref(false);
const selectedFilePath = ref<string | null>(null);
const activePanelWidth = ref(320);

export function useLayout() {
	function setLoading(value: boolean): void {
		loading.value = value;
	}

	function openFileDiff(filePath: string): void {
		selectedFilePath.value = filePath;
	}

	function closeFileDiff(): void {
		selectedFilePath.value = null;
	}

	return {
		loading: readonly(loading),
		selectedFilePath: readonly(selectedFilePath),
		activePanelWidth,
		setLoading,
		openFileDiff,
		closeFileDiff,
	};
}
