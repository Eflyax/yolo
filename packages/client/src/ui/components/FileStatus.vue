<template>
	<span :class="['file-status', `file-status--${status}`]">
		<Icon
			v-if="status === 'M'"
			name="mdi-pencil"
			class="file-status__icon"
		/>
		<Icon
			v-else-if="status === 'A'"
			name="mdi-plus"
			class="file-status__icon"
		/>
		<Icon
			v-else-if="status === 'R'"
			name="mdi-swap-horizontal"
			class="file-status__icon"
		/>
		<Icon
			v-else-if="status === 'D'"
			name="mdi-minus"
			class="file-status__icon"
		/>
	</span>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Icon from './Icon.vue';

export default defineComponent({
	components: {Icon},
	props: {
		status: {
			type: String,
			required: true,
			validator: (value: string) => ['M', 'A', 'R', 'D'].includes(value),
		},
	},
});
</script>

<style lang="scss" scoped>
.file-status {
	display: inline-flex;
	align-items: center;

	&__icon {
		flex-shrink: 0;
		width: 14px;
		height: 14px;
	}

	&--M .file-status__icon { fill: #f89b6f; }
	&--A .file-status__icon { fill: #6ff8a0; }
	&--D .file-status__icon { fill: #f86f6f; }
	&--R .file-status__icon { fill: #6feef8; }
}
</style>
