<template>
  <el-breadcrumb class="app-breadcrumb">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in state.breadcrumbs" :key="item.path">
          <!-- 最后一项不能转跳 -->
        <span v-if="item.redirect === 'noRedirect' || index === state.breadcrumbs.length - 1" class="no-redirect">{{
          item.meta.title
        }}</span>
        <a v-else @click.prevent="state.handleLink(item)">
          {{ item.meta.title }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, watch } from "vue"
import { useRoute, useRouter, RouteLocationMatched } from "vue-router"
import { compile } from "path-to-regexp"
//在同一页面 所有组件的route值都是一样
const route = useRoute()
const router = useRouter()

//把含有正则表达式的路径转成字符串
const pathCompile = (path: string) => {
  const { params } = route
  const toPath = compile(path) //返回一个函数
  return toPath(params) 
}


//filter会把返回值转布尔进行判断  
//route.matched属性是一个当前路由页面层级关系的数组第一个是一级
const state = reactive({
  breadcrumbs: [] as Array<RouteLocationMatched>,
  getBreadcrumb: () => {
     state.breadcrumbs = route.matched.filter((item) => item.meta && item.meta.title)
    // state.breadcrumbs = matched.filter((item) => {
    //   return item.meta && item.meta.title && item.meta.breadcrumb !== false
    // })
  },
  handleLink(item: any) {
    const { redirect, path } = item
    if (redirect) {
      router.push(redirect).catch((err) => {
        console.warn(err)
      })
      return
    }
    router.push(pathCompile(path)).catch((err) => {
      console.warn(err)
    })
  }
})

watch(
  () => route.path,
  (path) => {
    if (path.startsWith("/redirect/")) {
      return
    }
    state.getBreadcrumb()
  }
)

onBeforeMount(() => {
  state.getBreadcrumb()
})
</script>

<style lang="scss" scoped>
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}

.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 20px;
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
