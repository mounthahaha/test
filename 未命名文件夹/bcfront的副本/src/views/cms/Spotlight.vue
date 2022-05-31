<template>
  <div class="Spotlight">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 新增輪播圖 展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="addSpotlight()">
            <v-icon>add_photo_alternate</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_spotlight_addCarousel') }}</span>
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
        <v-row dense class="d-flex align-center justify-space-between">
          <v-col>
            <v-text-field
              v-model="searchOption.title"
              clearable
              hide-details
              solo
              persistent-hint
              :placeholder="$t('cms_spotlight_enterTitile')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="searchOption.deleted"
              hide-details
              solo
              persistent-hint
              :items="[
                { text: $t('cms_spotlight_choose'), value: null },
                { text: $t('g_btn_enable'), value: `0` },
                { text: $t('g_btn_disable'), value: `1` },
              ]"
            ></v-select>
          </v-col>
          <v-col>
            <datetime-range v-model="searchOption.date" range-separator="g_datePick_to2" />
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :no-data-text="$t('g_text_noData')"
          :headers="headerComputed"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          :items="desserts"
          :loading="loading"
          :disable-sort="loading"
          :footer-props="{
            'items-per-page-options': [10, 50, 100, 150, 200],
            'items-per-page-text': $t('g_pagination_rows'),
          }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <!-- 操作 -->
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="updateSpotlight(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="deleteItem(item.Id)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.Deleted == false" icon color="red" v-bind="attrs" @click="offline(item.Id)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="green" v-bind="attrs" @click="online(item.Id)" v-on="on">
                      <v-icon>remove_red_eye</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.Deleted == false">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Id }}</td>
              <td class="text-left text-no-wrap">{{ item.Title }}</td>
              <td class="text-left text-no-wrap">
                {{ i18nItemsMap.has(item.LanguageCode) ? i18nItemsMap.get(item.LanguageCode).value : item.LanguageCode }}
              </td>
              <td class="text-left text-no-wrap">
                <v-img v-if="item.traceMobile" class="w5" :src="config.image_url + item.PictureMobile" height="40px" width="170px"></v-img>
              </td>
              <td class="text-left text-no-wrap">{{ item.Link }}</td>
              <td class="text-left text-no-wrap">{{ item.Order }}</td>
              <td class="text-left text-no-wrap">{{ item.online[0] }} - {{ item.online[1] }}</td>
              <td class="text-center">
                <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                  {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.EditBy }}</td>
              <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增輪播圖彈窗 -->
    <v-dialog v-model="infoBox" persistent width="800px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">
              {{ spotlight.Id ? $t('cms_spotlight_editCarousel') : $t('cms_spotlight_addCarousel') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="baseline">
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_spotlight_eventTitle') }}</v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model="spotlight.Title" required type="text"> </v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_spotlight_language') }}</v-label>
              </v-col>
              <v-col cols="10">
                <v-select v-model="spotlight.LanguageCode" :items="i18nSelectItems"></v-select>
              </v-col>
              <v-col cols="2">
                <v-label> {{ $t('cms_spotlight_link') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model="spotlight.Link" type="text" required> </v-text-field>
              </v-col>
              <v-col cols="2">
                <v-label> {{ $t('g_table_column_sort') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model.number="spotlight.Order" type="number" :placeholder="$t('cms_spotlight_placeholder_order')"> </v-text-field>
              </v-col>
              <!-- 啟用時間 -->
              <v-col cols="2">
                <v-label>{{ $t('cms_spotlight_activationTime') }}</v-label>
              </v-col>
              <v-col cols="10">
                <datetime-range v-model="spotlight.online" />
              </v-col>
              <!-- PC 圖片 -->
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_spotlight_pcPic') }}</v-label>
              </v-col>
              <v-col cols="10">
                <vue-core-image-upload
                  ref="uploaderPc"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedPc"
                  @errorhandle="imageError($event, 0)"
                >
                  <v-icon small right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_pcPicRecomm') }}</small>
                <span v-show="picErrorPc" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-col>
              <v-col cols="12">
                <v-card>
                  <v-img v-if="spotlight.tracePc" :src="spotlight.PicturePc" height="200px"> </v-img>
                </v-card>
              </v-col>
              <!-- Mobile 圖片 -->
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-0">star</v-icon>
                <v-label>{{ $t('cms_spotlight_mobilePic') }}</v-label>
              </v-col>
              <v-col cols="10">
                <vue-core-image-upload
                  ref="uploaderMobile"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedMobile"
                  @errorhandle="imageError($event, 1)"
                >
                  <v-icon small right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_mobildPicRecomm') }}</small>
                <span v-show="picErrorMobile" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-col>
              <v-col cols="12">
                <v-card> <v-img v-if="spotlight.traceMobile" :src="spotlight.PictureMobile" height="200px"> </v-img> </v-card>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeSpotlight()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import { shortcuts } from '@/utils';
import i18nMixin from '../../mixin/i18nMixin.js';

export default {
  name: 'Spotlight',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
  },
  mixins: [i18nMixin],
  data() {
    return {
      searchOption: {
        deleted: null,
        date: [],
      },
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['Created'],
        sortDesc: [true],
      },
      datePickerOptions: {
        shortcuts,
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'Action',
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
          lang: 'cms_spotlight_eventTitle',
          text: '活动标题',
          value: 'Title',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_spotlight_language',
          text: '语系',
          value: 'LanguageCode',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_spotlight_picture',
          text: '图片',
          value: 'PictureMobile',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_spotlight_link',
          text: '链接',
          value: 'Link',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序',
          value: 'Order',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_spotlight_availability',
          text: '上架时间',
          value: 'OnlineStart',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'Deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_spotlight_editor',
          text: '编辑者',
          value: 'EditBy',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      desserts: [],
      infoBox: false,
      spotlight: {
        Picture: '',
      },
      picErrorMobile: false,
      picErrorPc: false,
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
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
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
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      this.loadData(this.pagination.page);
    },
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
        title: this.searchOption.title,
        deleted: this.searchOption.deleted,
        sort: this.pagination.sortBy[0],
        asc: !this.pagination.sortDesc[0],
      };
      if (this.searchOption.date && this.searchOption.date.length > 0) {
        params.s = this.searchOption.date[0];
        params.e = this.searchOption.date[1];
      }
      api
        .get('/cms/spotlights', params)
        .then(data => {
          for (const index in data.result) {
            this.testImage(data.result[index]);
            data.result[index].online = [
              data.result[index].OnlineStart ? new Date(data.result[index].OnlineStart).Format('yyyy-MM-dd') : undefined,
              data.result[index].OnlineEnd ? new Date(data.result[index].OnlineEnd).Format('yyyy-MM-dd') : undefined,
            ];
          }
          if (data.result) {
            this.desserts = data.result;
            this.pagination.length = data.pageNum;
            this.pagination.totalItems = data.total;
          } else {
            this.desserts = [];
            this.pagination.length = 0;
            this.pagination.totalItems = 0;
          }
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addSpotlight() {
      this.spotlight = {
        PicturePc: '',
        tracePc: false,
        PictureMobile: '',
        traceMobile: false,
        online: [new Date(), new Date(new Date() * 1 + (365 * 10 + 2) * 60 * 60 * 24 * 1000)],
        Link: '/#',
      };
      this.infoBox = true;
    },
    updateSpotlight(item) {
      this.spotlight = _.cloneDeep(item);
      this.spotlight.online = item.online.length ? [new Date(item.online[0]), new Date(item.online[1])] : [];
      this.infoBox = true;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_spotlight_msg_disableCarousel'),
        ok() {
          api
            .post(`/cms/spotlight/offline/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    online(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_spotlight_msg_enableCarousel'),
        ok() {
          api
            .post(`/cms/spotlight/online/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    mergeSpotlight() {
      const $this = this;
      if (!$this.spotlight.Title) {
        $this.$store.commit('MsgError', this.$t('cms_spotlight_msg_titleEmpty'));
        return;
      } else if (!$this.spotlight.PictureMobile) {
        $this.$store.commit('MsgError', this.$t('cms_spotlight_msg_mobilePicEmpty'));
        return;
      } else if (!$this.spotlight.PicturePc) {
        $this.$store.commit('MsgError', this.$t('cms_spotlight_msg_pcPicEmpty'));
        return;
      }
      if (!$this.spotlight.Link) {
        $this.spotlight.Link = '/#';
        // $this.$store.commit('MsgError', '链结不可为空白');
        // return;
      }
      if (!$this.spotlight.online || $this.spotlight.online.length != 2) {
        // $this.$store.commit('MsgError', '启用时间不可为空');
        // return;
        $this.spotlight.online = [new Date(), new Date(new Date() * 1 + (365 * 10 + 2) * 60 * 60 * 24 * 1000)];
      }

      if ($this.spotlight.Order === '') {
        $this.spotlight.Order = 0;
        // return;
      }
      if (this.$refs.form.validate()) {
        if (this.spotlight.Picture == '') {
          $this.picError = true;
          return false;
        }
        let url = '/cms/spotlight';
        $this.spotlight.OnlineStart = $this.spotlight.online[0];
        $this.spotlight.OnlineEnd = $this.spotlight.online[1];
        if ($this.spotlight.Id > 0) {
          url += `/${$this.spotlight.Id}`;
        }
        api
          .post(url, this.spotlight)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadData();
            $this.infoBox = false;
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    imageuploadedPc(res) {
      const $this = this;
      if (res.result != '') {
        $this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        $this.spotlight.PicturePc = res.result[0];
        $this.testImage($this.spotlight);
        $this.picErrorPc = false;
      } else {
        $this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedMobile(res) {
      const $this = this;
      if (res.result != '') {
        $this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        $this.spotlight.PictureMobile = res.result[0];
        $this.testImage($this.spotlight);
        $this.picErrorMobile = false;
      } else {
        $this.$store.commit('MsgError', res.error);
      }
    },
    testImage(obj) {
      const tester = new Image();
      const testerPC = new Image();
      obj.traceMobile = false;
      tester.onload = () => {
        obj.traceMobile = true;
      };
      tester.src = obj.PictureMobile;

      obj.tracePc = false;
      testerPC.onload = () => {
        obj.tracePc = true;
      };
      testerPC.src = obj.PicturePc;
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
    },
    imageError(error, index) {
      document.querySelectorAll('input[type=file]')[index].value = '';
      const isSizeExceed = /FILE IS TOO LARGER/gi.test(error);
      this.$store.commit('MsgError', isSizeExceed ? this.$t('cms_spotlight_msg_fileToBig1M') : '');
    },
    deleteItem(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('cms_spotlight_msg_deleteCarousel'),
        ok() {
          api
            .delete(`/cms/spotlight/${id}`)
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
  },
};
</script>
<style lang="scss">
.spotlight {
  .w5 {
    width: 8em;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0;
    display: block;
    .v-responsive__sizer {
      width: 100%;
    }
  }
  .nowrap {
    white-space: nowrap;
  }
  .el-vuetify-text-field {
    &.el-input__inner {
      height: 48px !important;
      max-width: 100%;
      -webkit-box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
      box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    }
  }
}
</style>
