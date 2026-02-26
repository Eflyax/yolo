export const GRAPH_COLORS = [
	'#30a0bf',
	'#0f69f7',
	'#8e02c2',
	'#9f544c',
	'#984c80',
	'#77509b',
] as const;

export function getGraphColor(level: number): string {
	return GRAPH_COLORS[level % GRAPH_COLORS.length]!;
}
