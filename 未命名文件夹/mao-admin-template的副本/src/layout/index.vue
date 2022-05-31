<template>
  <div class="common-layout">
    <el-container>
      <Sidebar />
      <el-container class="is-vertical">
        <NavigationBar></NavigationBar>
         <TagsView v-if="settingsStore.showTagsView" />
        <AppMain ></AppMain>
        <RightPanel v-if="settingsStore.showSettings">
          <Settings />
        </RightPanel>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang='ts'>
import { Sidebar, NavigationBar,AppMain, RightPanel, Settings,TagsView } from './components/'
import { useSettingsStore } from "@/store/modules/settings"
const settingsStore = useSettingsStore()
console.log('layout重新渲染');

</script>




<style lang='scss' >
.common-layout,
.el-container,
.el-aside {
  height: 100%;
}
.is-vertical {
  position: relative;
}
.el-main {
  overflow: hidden;
}
</style>