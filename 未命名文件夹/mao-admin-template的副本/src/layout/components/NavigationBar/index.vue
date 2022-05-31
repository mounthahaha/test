<template>
  <el-header>
    <div class="navbar">
      <Hamburger :is-active="appStore.sidebar.opened" @click="appStore.toggleSidebar(false)"></Hamburger>
      <BreadCrumb></BreadCrumb>
      <div class="right-menu">
        <Screenfull v-if="settingsStore.showScreenfull"></Screenfull>
        <el-dropdown class="right-menu-item" style="cursor:pointer;">
          <SvgIcon style="font-size: 32px;" name="language"/>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in i18nStore.langItem" divided @click="i18nStore.toggleLocale(item.langCode)">
                <span style="display: block">{{item.value}}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-dropdown class="right-menu-item" style="cursor:pointer;">
          <el-avatar :icon="UserFilled" :size="34" />
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <a target="_blank" href="https://www.baidu.com">
                <el-dropdown-item>百度一下</el-dropdown-item>
              </a> -->
              <el-dropdown-item  @click="logout">
                <span style="display: block">{{ t('g_logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div style="font-size: 20px;font-weight: 700;">{{userStore.name}}</div>
      </div>
    </div>
  </el-header>
</template>

<script setup lang='ts'>
import { computed, reactive } from "vue"
import { useRouter } from "vue-router"
import { useAppStore } from "@/store/modules/app"
import { UserFilled } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
import { useSettingsStore } from "@/store/modules/settings"
import { useI18nStore } from '@/store/modules/i18n'
import Hamburger from "../Hamburger/index.vue"
import Screenfull from "@/components/Screenfull/index.vue"
import BreadCrumb from "../BreadCrumb/index.vue"
import { useI18n } from "vue-i18n"


const i18nStore = useI18nStore()
const { t } = useI18n()


const settingsStore = useSettingsStore()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const  logout = async()=>{
  await userStore.logout()
  router.replace('/login')
}


</script>




<style lang='scss' scoped>
.el-header {
  background-color: #fff;
}
.el-breadcrumb {
  flex: 1;
}
.navbar {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: space-between;
  .right-menu {
    display: flex;
    align-items: center;
    &>*:not(:last-child) {
      margin-right: 30px;
    }
  }
}
</style>