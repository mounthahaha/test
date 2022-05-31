import gamePlatFormMixin from './gamePlatFormMixin.js';
import gameMenuMixin from './gameMenuMixin.js';
export default {
  // 要注意引用問題
  mixins: [gamePlatFormMixin, gameMenuMixin],
  // 為了防止使用mixins時設定沖突，名稱請加上'gameMenuPlatForm'當前綴
  data() {
    return {
      // 指定遊戲平臺的id
      gameMenuPlatFormCurrentFormId: null,
    };
  },
  methods: {
    // 更新gameMenuPlatFormCurrentFormId
    gameMenuPlatFormChangeFormID(id) {
      this.gameMenuPlatFormCurrentFormId = id;
    },
  },
  computed: {
    // 指定遊戲平臺的遊戲列表
    gameMenuPlatFormList() {
      return this.gameMenuList.filter(element => element.platformId === this.gameMenuPlatFormCurrentFormId);
    },
    // gameMenuPlatFormList的v-select的items版本
    gameMenuPlatFormSelectItems() {
      return this.gameMenuPlatFormList.map(element => ({ text: element.name, value: element.id }));
    },
  },
};
