<template>
	<span :class="['file-status', `file-status--${status}`]">
		<icon
			v-if="status === 'M'"
			name="mdi-pencil"
			class="file-status__icon"
		/>
		<icon
			v-else-if="status === 'A'"
			name="mdi-plus"
			class="file-status__icon"
		/>
		<icon
			v-else-if="status === 'R'"
			name="mdi-plus"
			class="file-status__icon"
		/>
		<icon
			v-else-if="status === 'D'"
			name="mdi-minus"
			class="file-status__icon"
		/>
	</span>
</template>

<script>
export default {
	props: {
		status: {
			type: String,
			required: true,
			validator: (value) => ['M', 'A', 'R', 'D'].includes(value)
		}
	}
}
</script>

<style lang="scss" scoped>
.file-status {
	display: inline-flex;

	svg {
		width: 20px;
		height: 20px;
	}

	&__icon {
		flex-shrink: 0;
		font-size: 10px;
		font-weight: 700;
		width: 14px;
		text-align: center;
		border-radius: 2px;
		padding: 1px 2px;
	}

	&--M &__icon {
		fill: #f89b6f;
	}

	&--A &__icon {
		fill: #6ff8a0;
	}

	&--D &__icon {
		fill: #f86f6f;
	}

	&--R &__icon {
		fill: #6feef8;
	}
}
</style>
