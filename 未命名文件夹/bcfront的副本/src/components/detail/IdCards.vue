<template>
  <div class="IdCards">
    <v-overlay absolute :value="loading"></v-overlay>
    <v-toolbar elevation="0" class="pl-2 rounded-lg">
      <v-icon class="mr-2">account_box</v-icon>
      <v-toolbar-title>{{ $t('player_detail_idcard_info') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="showDetail = !showDetail">
        <v-icon>{{ showDetail ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- 列表 -->
    <v-container v-if="showDetail" fluid class="pa-0">
      <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
        <v-row dense wrap>
          <!-- 上傳圖片 -->
          <v-col v-if="!cardsList || cardsList.length < 4" cols="3" class="px-1">
            <v-card outlined class="elevation-0 ma-1" color="grey lighten-3">
              <img-inputer
                ref="fileUploader"
                v-model="file1"
                accept="image/gif,image/png,image/jpeg,image/jpg,image/bmp,image/webp"
                theme="light"
                class="d-flex"
                icon="img"
                size="large"
                auto-upload
                :headers="uploadHeader"
                action="/api/global/fileid"
                :on-success="res => uploaded(res)"
                :on-error="onError"
                :name="`files`"
                :bottom-text="$t('g_profile_chooseImg')"
                :hover-text="$t('g_profile_chooseImg')"
                :placeholder="$t('g_profile_chooseImg')"
                :readonly-tip-text="$t('g_profile_imgReadonly')"
              />
              <div class="d-flex align-center justify-center ma-5">
                <v-icon class="mr-2">stars</v-icon>
                <h4>{{ $t('cms_spotlight_mobildPicRecomm') }}</h4>
              </div>
            </v-card>
          </v-col>
          <!-- 顯示圖片 -->
          <v-col v-for="(item, i) in cardsList" :key="i" cols="3">
            <v-card outlined class="elevation-0 ma-1" color="grey lighten-3">
              <v-card-text>
                <v-img class="idcard-actions align-center d-flex text-center" :src="`${item}`" aspect-ratio="2.3">
                  <v-btn color="primary" class="primary--text mx-1" fab small outlined @click="zoom(item)">
                    <v-icon>zoom_in</v-icon>
                  </v-btn>
                  <v-btn color="primary" class="primary--text mx-1" fab small outlined @click="deleteCards(i)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-img>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <!-- 圖片詳情彈窗 -->
    <v-dialog v-model="showZoomImg" persistent width="800" :retain-focus="false">
      <v-toolbar dark color="primary">
        <v-toolbar-title class="headline ml-2">{{ $t('player_detail_profile_idcard_kycDetail') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip class="pa-1" color="transparent" @click.native="showZoomImg = false">
          <v-icon>close</v-icon>
        </v-chip>
      </v-toolbar>
      <v-card white align="center" class="pa-5">
        <v-slider v-model="zoomImgWidth" class="align-self-stretch" min="200" max="800" dense></v-slider>
        <img :width="zoomImgWidth" :src="zoomImg" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import ImgInputer from 'vue-img-inputer';
import 'vue-img-inputer/dist/index.css';

export default {
  name: 'IdCards',
  components: {
    ImgInputer,
  },
  props: {
    userId: {
      type: Number,
      default: () => 0,
    },
    cards: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      file1: null,
      loading: false,
      showDetail: true,
      showZoomImg: false,
      editType: {},
      photos: [],
      addPhoto: {},
      zoomImg: null,
      zoomImgWidth: '300',
    };
  },
  computed: {
    cardsList() {
      let arr;
      if (this.cards != '') {
        try {
          arr = JSON.parse(this.cards);
        } catch (e) {
          console.log(e);
        }
        if (arr == '') {
          return [];
        }
        return arr;
      } else {
        return [];
      }
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
  },
  methods: {
    deleteCards(i) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.$store.commit('Confirm', {
        text: this.$t('player_detail_idcard_msgConfirmDelete'),
        ok: () => {
          api
            .delete(`/player/card/${this.userId}/${i}`)
            .then(data => {
              this.$store.commit('MsgOk', this.$t('g_msgSet'));
              const list = this.cardsList;
              list.splice(i, 1);
              this.cardStr = JSON.stringify(list);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            })
            .finally(() => {
              this.loading = false;
            });
        },
        cancel: () => {
          this.loading = false;
        },
      });
    },
    uploaded(res) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const list = _.cloneDeep(this.cardsList);
      list.push(res.result[0]);
      api
        .post(`/player/updateid`, { userid: String(this.userId), cardstr: JSON.stringify(list) })
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
          this.cards = JSON.stringify(list);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.file1 = null;
          this.loading = false;
        });
      this.$forceUpdate();
    },
    onError() {
      this.SET_MESSAGE({ message: this.textFilter('apiError') });
    },
    zoom(img) {
      this.zoomImg = img;
      this.showZoomImg = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.img-inputer {
  width: auto;
}
</style>
