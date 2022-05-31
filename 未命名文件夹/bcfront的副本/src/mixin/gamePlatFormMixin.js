import { mapActions, mapGetters } from 'vuex';

export default {
  // 要注意引用問題 ＝> gameMenuPlatFormMixin.js
  // 為了防止使用mixins時設定沖突，名稱請加上'gamePlatform'當前綴
  computed: {
    // 遊戲平臺列表的原始資料
    ...mapGetters(['gamePlatformList']),
    // 遊戲平臺列表的Map版本
    gamePlatformMap() {
      return new Map(this.gamePlatformList.map(element => [element.Id, element.SystemCode]));
    },
    // 遊戲平臺列表的v-select的items版本
    gamePlatformSelectItems() {
      return this.gamePlatformList.map(element => ({ text: element.SystemCode, value: element.Id }));
    },
  },
};
