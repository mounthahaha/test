<script lang="ts" setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const key = computed(() => {
  return route.path
})

</script>

<template>
  <el-main>
    <!-- 接收带prop 的插槽只能用在自己的插槽上 v-slot:item="slotProps" 如果有两个插槽不能在组件上用v-slot -->
           <router-view v-slot="{ Component }">    <!-- router-view 是一个函数式组件 -->
      <transition name="fade-transform" mode="out-in">
        <!-- <keep-alive> -->
          <!-- 已注册组件的名字，或一个组件的选项对象,key属性不会加在真实dom元素上 -->
        <component :is="Component" :key="key" /> 
        <!-- </keep-alive> -->
      </transition>
    </router-view>  
        </el-main>
   
</template>

<style lang="scss" >
.el-main {
  padding: 20px 10px;
  overflow: auto !important;
  font-size: 14px;
}
.app-main {
  /* 50 = navbar height  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: scroll;

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
