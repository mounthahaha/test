import { mapActions, mapGetters } from 'vuex';

export default {
  // 要注意引用問題 ＝> gameMenuPlatFormMixin.js
  // 為了防止使用mixins時設定沖突，名稱請加上'gamePlatform'當前綴
  computed: {
    // 遊戲列表的原始資料
    ...mapGetters(['gameMenuList']),
    // 遊戲列表的Map版本
    gameMenuMap() {
      return new Map(this.gameMenuList.map(element => [element.id, element]));
    },
    // 遊戲列表的v-select的items版本
    gameMenuSelectItems() {
      return this.gameMenuList.map(element => ({ text: element.groupName, value: element.id }));
    },
  },
};
