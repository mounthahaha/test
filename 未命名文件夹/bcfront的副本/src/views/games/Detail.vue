<template>
  <div class="Detail">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> sports_soccer </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!--  搜尋 重置 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            class="elevation-0 ml-4 mr-2"
            fab
            dark
            small
            medium
            depressed
            v-on="on"
            @click="() => (infoBox = true)"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增游戏配置</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions()">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-if="searchShow" v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn v-else v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t('g_btn_searchHide') }}</span>
        <span v-else>{{ $t('g_btn_searchExpand') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card v-if="searchShow" elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="align-center">
          <v-col>
            <v-select
              v-model="searchOption.platformId"
              solo
              clearable
              hide-details
              single-line
              persistent-hint
              :items="gamePlatformSelectItems"
              label="游戏平台分类"
            >
            </v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.type"
              hide-details
              clearable
              solo
              label="平台"
              placeholder="平台"
              :items="[
                { value: 1, text: 'PC' },
                { value: 2, text: 'Mobile' },
              ]"
            >
            </v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.groupId"
              solo
              clearable
              hide-details
              single-line
              persistent-hint
              :items="gameGroupSelectItems"
              label="游戏群组"
            >
            </v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.languageCode"
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
          <v-col>
            <v-text-field
              v-model="searchOption.gameName"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('game_detail_headers_showTitle')"
              :placeholder="$t('game_detail_headers_showTitle')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model.number="searchOption.showFront"
              solo
              clearable
              hide-details
              single-line
              persistent-hint
              :items="[
                { text: '显示', value: 1 },
                { text: '不显示', value: 0 },
              ]"
              :label="$t('game_detail_headers_frontShow')"
            >
            </v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="pusheds"
          :loading="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          :server-items-length="pagination.totalItems"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item, index: listIndex }">
            <tr>
              <td class="text-center text-no-wrap">
                <v-chip label outlined :color="item.showFront ? 'green' : 'red'" @click="item.showFront = showFrontEvent(item.showFront)">
                  {{ item.showFront ? '显示' : '不显示' }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.id }}</td>
              <td class="text-left text-no-wrap i18n-class">
                <v-select
                  v-model="item.groupId"
                  :width="'50px'"
                  solo
                  hide-details
                  single-line
                  persistent-hint
                  :items="gameGroupSelectItems"
                  label="游戏群组"
                >
                </v-select>
              </td>
              <td class="text-left text-no-wrap i18n-class">
                <v-select
                  v-model="item.languageCode"
                  :width="'50px'"
                  solo
                  hide-details
                  single-line
                  persistent-hint
                  :items="i18nSelectItems"
                  label="语系名称"
                >
                </v-select>
              </td>
              <td class="text-left text-no-wrap">
                <v-text-field v-model="item.gameName" type="text" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
              </td>
              <td class="text-left text-no-wrap">
                <div class="picture-group">
                  <template v-for="(imgItem, index) in item.picture">
                    <v-img
                      :key="index"
                      class="cursor-class"
                      :src="config.image_url + imgItem.src"
                      width="60px"
                      contain
                      @click="openImageDialog(imgItem, listIndex, index)"
                    ></v-img>
                  </template>
                  <div class="update">
                    <v-icon dark color="primary" size="40" @click="openImageDialog({}, listIndex, item.picture.length)">add_photo_alternate</v-icon>
                  </div>
                </div>
              </td>
              <td class="text-left text-no-wrap">
                <!-- gameContent -->
                <v-chip
                  label
                  outlined
                  :color="item.gameContent && item.gameContent.length !== 0 ? 'green' : 'blue'"
                  @click="openGameContentDialog(listIndex, item.gameContent)"
                >
                  {{ item.gameContent.length === 0 ? '未设定内文' : '己设定内文' }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <v-text-field v-model="item.order" type="number" label="" :rules="[v => !!v || '请填写内容']"> </v-text-field>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined :color="item.type === 1 ? 'green' : 'red'" @click="item.type = showTypeEvent(item.type)">
                  {{ item.type === 1 ? 'pc' : 'mobile' }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined :color="'green'" @click="openGameLinkDialog(listIndex)">
                  {{ gameMenuMap.has(item.gameDetailId) ? gameMenuMap.get(item.gameDetailId).name : item.gameDetailId }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="updateGameData(item)" v-on="on">
                      <v-icon>save</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_update') }}</span>
                </v-tooltip>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>
    <!-- 圖片彈窗 -->
    <image-dialog v-model="showImageDialog" :start-image-data="currentPictureData" @deleteImage="delectPicture" @editImage="editPicture" />
    <!-- 內文彈窗 -->
    <content-dialog v-model="showgameContent" :start-content-data="currentGameContent" @editContent="editGameContent" />
    <!-- 遊戲鍵結彈窗 -->
    <game-link-dialog v-model="showgameLinkDialog" @editGameLinkID="linkId => editGameLink(currentPushedsIndex, linkId)" />
    <!-- 新增游戏配置彈窗-->
    <game-detail-dialog v-model="infoBox" @addGameData="addGameData" />
  </div>
</template>
<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import { jsonEncode, jsonDecode } from '@/utils/json.js';
import ImageDialog from '@/components/ImageDialog.vue';
import ContentDialog from '@/components/ContentDialog.vue';
import GameLinkDialog from './components/GameLinkDialog.vue';
import GameDetailDialog from './components/GameDetailDialog.vue';
import gameMenuPlatFormMixin from '@/mixin/gameMenuPlatFormMixin.js';
import i18nMixin from '@/mixin/i18nMixin.js';
import gameGroupMixin from '@/mixin/gameGroupMixin.js';
import gameDataMixin from '@/mixin/gameDataMixin.js';

export default {
  name: 'Spotlight',
  components: {
    ImageDialog,
    GameLinkDialog,
    GameDetailDialog,
    ContentDialog,
  },
  mixins: [gameMenuPlatFormMixin, i18nMixin, gameGroupMixin, gameDataMixin],
  data() {
    return {
      searchShow: true,
      loading: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortDesc: [],
        sortBy: [],
      },
      headers: [
        {
          lang: 'game_detail_headers_frontShow',
          text: '前台显示',
          value: 'showFront',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: '游戏群组',
          text: '遊戲群組',
          value: 'groupId',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: '显示语系',
          text: '語系',
          value: 'languageCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'game_detail_headers_showTitle',
          text: '显示名称',
          value: 'gameName',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'game_detail_headers_cover',
          text: '圖片',
          value: 'picture',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: '内文',
          text: '内文',
          value: 'gameContent',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          value: 'order',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'game_detail_headers_device',
          text: '平台',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: '实际连接游戏',
          text: '實際連接遊戲',
          value: 'gameDetailId',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'actions',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      games: [],
      platforms: [],
      pusheds: [],
      pushed: {},
      infoBox: false,
      searchOption: {},
      showImageDialog: false,
      currentPictureData: {},
      showgameLinkDialog: false,
      currentPushedsIndex: null,
      showgameContent: false,
      currentGameContent: [],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
    'pagination.sortDesc'(desc) {
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadPlatforms(p) {
      this.loading = true;
      api
        .get('/games/platforms')
        .then(data => {
          this.platforms = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      this.loading = true;
      const params = {
        page: p,
        num: this.pagination.itemsPerPage,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
        ...this.searchOption,
      };
      api
        .get('/games/grouplist', params)
        .then(data => {
          this.pusheds = data.result.map(element => this.processAPIdata(element));
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    createParamsData(data) {
      const gameNameString = jsonEncode({ gameName: data.gameName, gameContent: data.gameContent });
      return {
        groupId: Number(data.groupId),
        picture: jsonEncode(data.picture),
        gameDetailId: data.gameDetailId,
        gameName: gameNameString,
        type: data.type,
        showFront: data.showFront,
        languageCode: data.languageCode,
        order: Number(data.order),
      };
    },
    updateGameData(gameData) {
      api
        .put(`/games/group`, { id: gameData.id, ...this.createParamsData(gameData) })
        .then(_ => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    addGameData(gameData) {
      api
        .post(`/games/group`, this.createParamsData(gameData))
        .then(_ => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    processAPIdata(data) {
      const { gameName = '', gameContent = [] } = jsonDecode(data.gameName, { gameName: '', gameContent: [] });
      return {
        ...data,
        picture: jsonDecode(data.picture, []),
        gameName,
        gameContent,
      };
    },
    showFrontEvent(num = 0) {
      return num === 0 ? 1 : 0;
    },
    hotEvent(flag = false) {
      return !flag;
    },
    showTypeEvent(num = 3) {
      // pc: 1, mobile:2, pc+mobile: 3
      return num === 1 ? 2 : 1;
    },
    delectPicture(data) {
      const { listIndex, pictureIndex } = data;
      const newPictureArr = [...this.pusheds[listIndex].picture].filter((_, index) => pictureIndex !== index);
      this.$set(this.pusheds, listIndex, { ...this.pusheds[listIndex], picture: newPictureArr });
    },
    editPicture(data) {
      const { listIndex, pictureIndex, ...pictureData } = data;
      let newPictureArr = [...this.pusheds[listIndex].picture];
      if (newPictureArr.length === pictureIndex) {
        newPictureArr = [...newPictureArr, pictureData];
      } else {
        newPictureArr = newPictureArr.map((element, index) => (pictureIndex === index ? pictureData : element));
      }
      this.$set(this.pusheds, listIndex, { ...this.pusheds[listIndex], picture: newPictureArr });
    },
    openImageDialog(data, listIndex, pictureIndex) {
      this.currentPictureData = { ...data, listIndex, pictureIndex };
      this.$nextTick(() => {
        this.showImageDialog = true;
      });
    },
    openGameLinkDialog(listIndex) {
      this.currentPushedsIndex = listIndex;
      this.$nextTick(() => {
        this.showgameLinkDialog = true;
      });
    },
    editGameLink(listIndex, linkID) {
      this.$set(this.pusheds, listIndex, { ...this.pusheds[listIndex], gameDetailId: linkID });
    },
    openGameContentDialog(listIndex, gameContent) {
      this.currentPushedsIndex = listIndex;
      this.currentGameContent = gameContent;
      this.$nextTick(() => {
        this.showgameContent = true;
      });
    },
    editGameContent(data) {
      this.$set(this.pusheds, this.currentPushedsIndex, { ...this.pusheds[this.currentPushedsIndex], gameContent: data });
    },
  },
};
</script>
<style lang="scss" scoped>
.picture-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 180px;
  justify-content: flex-start;
  align-items: center;
  .update {
    margin: 12px;
  }
}
.cursor-class {
  cursor: pointer;
}
.i18n-class {
  width: 200px;
}
</style>
