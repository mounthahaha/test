// import { mapActions, mapGetters } from 'vuex';

const gameGroupList = [
  {
    id: 1,
    name: '第一组',
  },
  {
    id: 2,
    name: '第二组',
  },
  {
    id: 3,
    name: '第三组',
  },
];

export default {
  // 為了防止使用mixins時設定沖突，名稱請加上'gameGroup'當前綴
  computed: {
    // gameGroupList的Map版本
    gameGroupMap() {
      return new Map(gameGroupList.map(element => [element.id, element]));
    },
    // gameGroupList的 v-select 的items值
    gameGroupSelectItems() {
      return gameGroupList.map(element => ({ text: element.name, value: element.id }));
    },
  },
};
