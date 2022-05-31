<template>
  <el-aside :style="{width:!appStore.sidebar.opened?'64px':'220px'}">
    <SidebarLogoVue v-if="settingsStore.showSidebarLogo" :collapse="!appStore.sidebar.opened"></SidebarLogoVue>
    <el-menu :router="true" :unique-opened="true" :collapse="!appStore.sidebar.opened" background-color="#152d3d" text-color="#C0C4CC"
      active-text-color="#fff" :default-active="activePath" :collapse-transition="false" mode="vertical">
      <SidebarItem v-for="item in needToShowRouts" :item="item" :is-collapse="!appStore.sidebar.opened"></SidebarItem>
    </el-menu>
  </el-aside>
</template>

<script setup lang='ts'>
import { useAppStore } from "@/store/modules/app"
import { constantRoutes } from '@/router';
import { computed } from '@vue/reactivity';
import SidebarLogoVue from './SidebarLogo.vue'
import SidebarItem from './SidebarItem.vue'
import { useRoute } from "vue-router";
import { useSettingsStore } from "@/store/modules/settings"
const settingsStore = useSettingsStore()
const appStore = useAppStore()
const route = useRoute()



//监听route,刷新给默认激活菜单的 index
const activePath = computed(()=>{
   return route.path
})

//过滤出需要展示的路由 
const needToShowRouts = computed(() => {
  return constantRoutes.filter(item => {
    let hasOnlyOneChild = false   
    //只有一个子路由的情况
    if (item.children && !item.meta) {
      hasOnlyOneChild = item.children.some(item => {
        return item.meta && !item.meta.hidden
      })
    }
    //只有多个子路由的情况
    return item.meta && !item.meta.hidden || hasOnlyOneChild
  })
})
</script>




<style lang='scss' >
.el-aside {
  overflow: hidden;
}
// collapse时hover出现右菜单的类名
.el-menu--popup {
  padding: 0;
}
.el-menu {
  height: 100%;
  border: 0;
   width: 100% !important;
   user-select: none;
  --el-menu-hover-bg-color:#243a49 !important;
 .el-sub-menu ,.el-menu-item,.el-sub-menu__title {
        min-height: 60px;
    line-height: 60px
  }
  .is-active:not(.el-sub-menu[aria-expanded="true"]) {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 60px;
      border-left: 6px solid #66b1ff ;
    }
    
  }
}
</style>