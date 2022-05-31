<template>
  <!-- 没有children -->
  <el-menu-item v-if="!item.children || !item.children.length" :index="`${item.path}`">
    <SvgIcon :name="item.meta.icon" style="font-size: 16px;" :style="{ 'margin-right': isCollapse ? '0' : '20px' }"></SvgIcon>
    <template #title>{{ item.meta.title }}0</template>
  </el-menu-item>
  <!-- children.lemgth === 1 -->
  <el-menu-item v-if="item.children && item.children.length === 1" :index="`/${item.children[0].path}`">
    <SvgIcon :name="item.children[0].meta.icon" style="font-size: 16px;"
      :style="{ 'margin-right': isCollapse ? '0' : '20px' }"></SvgIcon>
    <template #title>{{ item.children[0].meta.title }}1</template>
  </el-menu-item>
  <!-- 有children 并且长度大于1,不需要展示的路由已经被过滤-->
  <el-sub-menu v-else :index="`${item.path}`">
    <template #title>
      <SvgIcon :name="item.meta.icon" style="font-size: 16px;" :style="{ 'margin-right': isCollapse ? '0' : '20px' }">
      </SvgIcon>
      <span> {{ item.meta.title }}2</span>
    </template>

      <el-menu-item v-for="(item1, index1) in item.children" :index="`${item.path}/${item1.path}`">
        <template #title>{{ item1.meta.title }}</template>
      </el-menu-item>


  </el-sub-menu>
</template>

<script setup lang='ts'>
import { computed, PropType } from "vue"
import { RouteRecordRaw } from "vue-router"
import { isExternal } from "@/utils/validate"
import path from "path-browserify"
import SidebarItemLink from "./SidebarItemLink.vue"


defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
  },
  isCollapse: {
    type: Boolean,
    required: false
  }
})


</script>




<style lang='scss' scoped>
</style>