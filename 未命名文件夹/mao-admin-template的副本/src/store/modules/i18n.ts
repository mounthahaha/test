import store from "@/store"
import { defineStore } from "pinia"
import { getI18nStatus, setI18nStatus } from "@/utils/cookies"
import i18n from '@/main'


export const useI18nStore = defineStore({
  id: "i18n",
  state: () => {
    return {
      locale: getI18nStatus() || 'zh-CN',
      langItem: [
        {
          key: 'zh-CN',
          value: '简体中文',
          flag: 'cn',
          langCode: 'zh-CN',
        },
        {
          key: 'en',
          value: 'English',
          flag: 'us',
          langCode: 'en',
        },
        {
          key: 'zh-Hk',
          value: '繁體中文',
          flag: 'hk',
          langCode: 'zh-Hk',
        },
      ]
    }
  },
  actions: {
    toggleLocale(locale?:string) {
      if(arguments.length >=1) {
          this.locale = locale
      }
      setI18nStatus(this.locale)
      i18n.global.locale.value = this.locale
    },
  }
})

/** 在 setup 外使用 */
export function useI18nStoreHook() {
  return useI18nStore(store)
}

