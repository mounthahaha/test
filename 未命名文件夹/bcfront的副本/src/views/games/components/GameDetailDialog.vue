<template>
  <!-- 新增游戏配置彈窗-->
  <v-dialog v-model="value" persistent width="800px" @input="closeDialog">
    <v-card class="rounded-lg">
      <v-toolbar dark elevation="0" color="primary">
        <v-toolbar-title class="headline ml-2">{{ $t('game_management_btn_addNew') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click.native="closeDialog"> <v-icon>close</v-icon> </v-btn>
          </template>
        </v-menu>
      </v-toolbar>

      <v-container grid-list-md class="py-5 px-10">
        <!-- 遊戲組別 -->
        <v-row wrap>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>游戏群组</v-label>
          </v-col>
          <v-col cols="10">
            <v-select
              v-model="gameData.groupId"
              :width="'50px'"
              solo
              hide-details
              single-line
              persistent-hint
              :items="gameGroupSelectItems"
              label="游戏群组"
            >
            </v-select>
          </v-col>
        </v-row>
        <!-- 是否顯示 -->
        <v-row wrap>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>{{ $t('game_detail_headers_frontShow') }}</v-label>
          </v-col>
          <v-col cols="10">
            <v-chip label outlined :color="gameData.showFront ? 'green' : 'red'" @click="gameData.showFront = !gameData.showFront">
              {{ gameData.showFront ? '显示' : '不显示' }}
            </v-chip>
          </v-col>
        </v-row>
        <!-- 遊戲顯示名稱 -->
        <v-row wrap>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>显示名称</v-label>
          </v-col>
          <v-col cols="10">
            <v-text-field
              v-model="gameData.gameName"
              type="text"
              :label="$t('game_management_textfield_gameName')"
              :placeholder="$t('game_management_textfield_gameName')"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <!-- 排序 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>{{ $t('g_table_column_sort') }}</v-label>
          </v-col>
          <v-col cols="10">
            <v-text-field v-model="gameData.order" type="number" :label="'由大到小排序'" :placeholder="'选择排序'"> </v-text-field>
          </v-col>
        </v-row>
        <!-- 遊戲圖片 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>新增图片</v-label>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2" class="d-flex align-center"></v-col>
          <template v-for="(imgItem, index) in gameData.picture">
            <v-col :key="index" cols="2">
              <v-img class="cursor-class" :src="config.image_url + imgItem.src" width="80px" contain @click="openImageDialog(imgItem, index)"></v-img>
            </v-col>
          </template>
          <v-col cols="2">
            <div class="update">
              <v-icon dark color="primary" size="40" @click="openImageDialog({}, gameData.picture.length)">add_photo_alternate</v-icon>
            </div>
          </v-col>
        </v-row>
        <!-- 使用平臺 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>内文</v-label>
          </v-col>
          <v-col cols="10">
            <v-chip
              label
              outlined
              :color="gameData.gameContent && gameData.gameContent.length !== 0 ? 'green' : 'blue'"
              @click="openGameContentDialog(gameData.gameContent)"
            >
              {{ gameData.gameContent.length === 0 ? '未设定内文' : '己设定内文' }}
            </v-chip>
          </v-col>
        </v-row>
        <!-- 使用平臺 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>使用平台</v-label>
          </v-col>
          <v-col cols="10">
            <v-chip label outlined :color="gameData.type === 1 ? 'green' : 'blue'" @click="gameData.type = showTypeEvent(gameData.type)">
              {{ gameData.type === 1 ? 'pc' : 'mobile' }}
            </v-chip>
          </v-col>
        </v-row>
        <!-- 使用語系 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>使用語系</v-label>
          </v-col>
          <v-col cols="10">
            <v-select
              v-model="gameData.languageCode"
              solo
              clearable
              hide-details
              single-line
              persistent-hint
              :items="i18nSelectItems"
              label="语系名称"
            >
            </v-select>
          </v-col>
        </v-row>
        <!-- 游戏键结 -->
        <v-row>
          <v-col cols="2" class="d-flex align-center">
            <v-icon small color="red" class="mr-1">star</v-icon>
            <v-label>游戏键结</v-label>
          </v-col>
          <v-col cols="10">
            <template v-if="gameData.gameDetailId">
              <v-chip label outlined :color="'green'" @click="openGameLinkDialog">
                {{ gameMenuMap.has(gameData.gameDetailId) ? gameMenuMap.get(gameData.gameDetailId).name : gameData.gameDetailId }}
              </v-chip>
            </template>
            <template v-else>
              <v-chip label outlined :color="'red'" @click="openGameLinkDialog"> 请设定键结 </v-chip>
            </template>
          </v-col>
        </v-row>
      </v-container>
      <v-divider></v-divider>
      <v-card-actions class="pa-5">
        <v-spacer></v-spacer>
        <v-btn color="primary" depressed @click="addEvent()"> {{ $t('g_btn_confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
    <!-- 圖片彈窗 -->
    <image-dialog v-model="showImageDialog" :start-image-data="currentPictureData" @deleteImage="delectPicture" @editImage="editPicture" />
    <!-- 內文彈窗 -->
    <content-dialog v-model="showgameContent" :start-content-data="currentGameContent" @editContent="editGameContent" />
    <!-- 遊戲鍵結彈窗 -->
    <game-link-dialog v-model="showgameLinkDialog" @editGameLinkID="linkId => editGameLink(linkId)" />
  </v-dialog>
</template>

<script>
import ImageDialog from '../../../components/ImageDialog.vue';
import ContentDialog from '../../../components/ContentDialog.vue';
import GameLinkDialog from './GameLinkDialog.vue';
import gameMenuPlatFormMixin from '../../../mixin/gameMenuPlatFormMixin.js';
import i18nMixin from '../../../mixin/i18nMixin.js';
import gameGroupMixin from '../../../mixin/gameGroupMixin.js';

export default {
  name: 'GameDetailDialog',
  components: {
    ImageDialog,
    GameLinkDialog,
    ContentDialog,
  },
  mixins: [gameMenuPlatFormMixin, i18nMixin, gameGroupMixin],
  props: {
    // 彈窗專用參數，用來和v-modal組合
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showImageDialog: false,
      showgameLinkDialog: false,
      gameData: {
        groupId: 1,
        picture: [],
        gameDetailId: null,
        gameName: '',
        type: 1,
        showFront: 1,
        languageCode: 'zh-CN',
        order: 1,
        gameContent: [],
      },
      imgIndex: 0,
      currentPictureData: {},
      showgameContent: false,
      currentGameContent: [],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  methods: {
    // 彈窗專用事件，用來和v-modal組合
    closeDialog() {
      return this.$emit('input', false);
    },
    addEvent() {
      this.closeDialog();
      this.$emit('addGameData', this.gameData);
    },
    showTypeEvent(num = 1) {
      // pc: 1, mobile:2, pc+mobile: 3
      return num === 1 ? 2 : 1;
    },
    openImageDialog(data, pictureIndex) {
      this.currentPictureData = { ...data, pictureIndex };
      this.$nextTick(() => {
        this.showImageDialog = true;
      });
    },
    openGameLinkDialog() {
      this.showgameLinkDialog = true;
    },
    delectPicture(data) {
      const { pictureIndex } = data;
      const newPictureArr = [...this.gameData.picture].filter((_, index) => pictureIndex !== index);
      this.$set(this.gameData, 'picture', newPictureArr);
    },
    editPicture(data) {
      const { pictureIndex, ...pictureData } = data;
      let newPictureArr = [...this.gameData.picture];
      if (newPictureArr.length === pictureIndex) {
        newPictureArr = [...newPictureArr, pictureData];
      } else {
        newPictureArr = newPictureArr.map((element, index) => (pictureIndex === index ? pictureData : element));
      }
      this.$set(this.gameData, 'picture', newPictureArr);
    },
    editGameLink(gamelink) {
      this.$set(this.gameData, 'gameDetailId', gamelink);
    },
    openGameContentDialog(gameContent) {
      this.currentGameContent = gameContent;
      this.$nextTick(() => {
        this.showgameContent = true;
      });
    },
    editGameContent(contentList) {
      this.$set(this.gameData, 'gameContent', contentList);
    },
  },
};
</script>

<style lang="scss" scoped>
.picture-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 320px;
  justify-content: flex-start;
  align-items: center;
  .update {
    margin: 12px;
  }
}
</style>
