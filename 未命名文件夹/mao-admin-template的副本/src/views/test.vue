<template>
<button @click="i18nStore.toggleLocate('zh-CN')">xxxxxx</button>

  <div class="test child">
    <span class="child">{{t('player_detail_gamelogs_headers_rule_type')}}</span>
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '@/store/modules/i18n'
const i18nStore  = useI18nStore()
const {t} = useI18n()
</script>




<style lang='scss' scoped>
.test {
  color: red;
  &.child {
    color: pink;
  }
}
</style>