export default {
  created() {
    // 載入遊戲平臺資料
    this.$store.dispatch('GET_GAMEPLATFORM');
    // 載入遊戲組別資料
    this.$store.dispatch('GET_GAMEMENU');
  },
};
