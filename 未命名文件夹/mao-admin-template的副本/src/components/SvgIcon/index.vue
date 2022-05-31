<template>
  <!-- 颜色设置为currentColor，在使用svg图标时，颜色就会从父元素继承。<defs>不会显示可以用use在其他地方复用,symbol元素本身是不呈现的（类似defs  -->
  <div v-if="isExternalComputed" :style="styleExternalIcon" class="svg-external-icon svg-icon" :class="className" />
  <svg v-else :class="className" aria-hidden="true" class="svg-icon">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { isExternal } from '../../utils/validate'

const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  }
})

const isExternalComputed = computed(() => isExternal(props.name))
const styleExternalIcon = computed(() => ({
  mask: `url(${props.name}) no-repeat 50% 50%`,
  '-webkit-mask': `url(${props.name}) no-repeat 50% 50%`
}))


// 项目内的svg图标文件 //要加#类似元素选择器
const iconName = computed(() => `#icon-${props.name}`)
</script>



<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
