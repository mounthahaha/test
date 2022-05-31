import { mapActions, mapGetters } from 'vuex';

export default {
  // 為了防止使用mixins時設定沖突，名稱請加上'i18n'當前綴
  computed: {
    ...mapGetters({
      i18nlangItem: 'i18n/langItem',
      i18nlocale: 'i18n/locale',
    }),
    i18nItemsMap() {
      return new Map(this.i18nlangItem.map(element => [element.key, element]));
    },
    // v-select 的items值
    i18nSelectItems() {
      return this.i18nlangItem.map(element => ({ text: element.value, value: element.langCode }));
    },
  },
};
