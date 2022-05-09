<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const key = computed(() => {
  return route.path
})
</script>

<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
     <!-- 组件被transition包裹,里面必须只能有一个根节点 -->
      <transition name="fade-transform" mode="out-in">
        <!-- <keep-alive> -->
        <component :is="Component" :key="key" />
        <!-- </keep-alive> -->
      </transition>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.app-main {
  /* 50 = navbar height  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
  height: 100vh;
  overflow: auto;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }
  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>
