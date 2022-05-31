<template>
  <div class="Tags">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 新增 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1, true)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search2') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="initSelector">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="tagDialog = true">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('player_tag_addTag') }}</span>
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
              v-model="searchOption.name"
              clearable
              hide-details
              solo
              persistent-hint
              :placeholder="$t('player_tag_placeholder_enterTag')"
              @keydown.enter="loadData(1, true)"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerComputed"
          :items="desserts"
          :loading="loading"
          :options.sync="pagination"
          :server-items-length="pagination.totalItems"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left text-no-wrap">{{ item.name }}</td>
                <td class="text-left text-no-wrap">{{ item.desc }}</td>
                <td class="text-left text-no-wrap">
                  <v-chip small label text-color="white" :color="item.color">{{ item.color }}</v-chip>
                </td>
                <td class="text-center text-no-wrap">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" @click="deleteTag(item.id)" v-on="on">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_delete') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
        </div>
      </v-card>
    </v-container>

    <!-- 新增標籤彈窗 -->
    <v-dialog v-model="tagDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2"> {{ $t('player_tag_addPlayerTag') }} </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="tagDialog = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>

        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap align="baseline">
            <v-col cols="12">
              <v-text-field
                ref="Name"
                v-model="tag.Name"
                :rules="[() => !!tag.Name || $t('g_text_required2'), () => (!!tag.Name && tag.Name.length <= 8) || $t('player_tag_just8Word')]"
                :label="$t('player_tag_tagName')"
                :placeholder="$t('player_tag_placeholder_enterTagName')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="tag.Desc" :label="$t('player_tag_desc')" :placeholder="$t('player_tag_placeholder_enterDesc')"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-menu :close-on-content-click="false" offset-x>
                <template #activator="{ on }">
                  <v-text-field
                    ref="color"
                    v-model="tag.Color"
                    :color="tag.Color"
                    :rules="[() => !!tag.Color || $t('g_text_required2')]"
                    :label="$t('player_tag_color')"
                    :placeholder="$t('player_tag_placeholder_color')"
                    readonly
                    append-icon="color_lens"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-card>
                  <material-picker v-model="ColorObj" @input="updateValue"></material-picker>
                </v-card>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.native="resetDialog()">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" depressed @click.native="saveTag">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { Sketch } from 'vue-color';

const defaultProps = {
  hex: '#194d33e6',
  hsl: {
    h: 150,
    s: 0.5,
    l: 0.2,
    a: 0.9,
  },
  hsv: {
    h: 150,
    s: 0.66,
    v: 0.3,
    a: 0.9,
  },
  rgba: {
    r: 25,
    g: 77,
    b: 51,
    a: 0.9,
  },
  a: 0.9,
};

export default {
  name: 'TagList',
  components: {
    'material-picker': Sketch,
  },
  data() {
    return {
      tag: {},
      showPicker: false,
      ColorObj: defaultProps,
      tagDialog: false,
      searchOption: {
        date: [],
        name: '',
      },
      searchShow: true,
      loading: false,
      pagination: {
        length: 0,
        itemsPerPage: 10,
      },
      headers: [
        {
          lang: 'player_tag_column_tagName',
          text: '标签名称',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_tag_column_description',
          text: '描述',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_tag_column_tagColor',
          text: '标签颜色',
          value: 'source_url',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      desserts: [],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
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
  },
  mounted() {
    // this.loadData(1);
  },
  methods: {
    loadData(p) {
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      api
        .get('/player/tags', this.searchOption)
        .then(data => {
          this.desserts = data.result.tags == null ? [] : data.result.tags;
          this.pagination.length = data.result.pageNums;
          this.pagination.totalItems = data.result.total;
          this.loading = false;
          this.sum = data.result.sum;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    saveTag() {
      let flag = true;
      ['Name', 'color'].forEach(item => {
        if (this.$refs[item] && Object.keys(this.$refs[item]).length !== 0) {
          if (!this.$refs[item].validate(true)) {
            flag = false;
          }
        }
      });
      if (flag) {
        const $this = this;
        api
          .post('/player/tag', $this.tag)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgAddSuccess'));
            $this.tagDialog = false;
            $this.tag = {};
            $this.loadData();
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    deleteTag(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('player_tag_sureToDeleteTag'),
        ok() {
          api
            .delete(`/player/tag/${id}`)
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgDelete'));
              $this.loadData(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    updateValue(value) {
      this.tag.Color = value.hex;
    },
    initSelector() {
      ['name'].forEach(key => (this.searchOption[key] = null));
    },
    resetDialog() {
      this.ColorObj = defaultProps;
      this.tag = {};
      this.tagDialog = false;
    },
  },
};
</script>
