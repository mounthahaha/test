<template>
  <div class="Setting">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> sports_soccer </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增游戏配置 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addSetting">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增游戏配置</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :no-data-text="$t('g_text_noData')"
          :headers="headerComputed"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :items="pusheds"
          :loading="loading"
          :footer-props="{ 'items-per-page-options': [25, 50, 100, 150, 200], 'rows-per-page-text': $t('g_pagination_rows') }"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="updateApi(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.Deleted == false" icon color="red" v-bind="attrs" @click="offline(item.Id)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="green" v-bind="attrs" @click="online(item.Id)" v-on="on">
                      <v-icon>add_circle</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.Deleted == false">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                  {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Id }}</td>
              <td class="text-left text-no-wrap">{{ item.Name }}</td>
              <td class="text-left text-no-wrap">
                <v-chip v-if="item.GameMode == 1" label outlined small color="red"> A </v-chip>
                <v-chip v-else-if="item.GameMode == 2" label outlined small color="blue"> B </v-chip>
                <v-chip v-else label outlined small color="green"> A+B </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Order }}</td>
              <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
        </div>
      </v-card>
    </v-container>

    <!-- 新增游戏配置彈窗-->
    <v-dialog v-model="infoBox" persistent width="500px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">{{ $t('game_management_btn_addNew') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="pushed.Name"
                  type="text"
                  :label="$t('game_management_textfield_gameName')"
                  :placeholder="$t('game_management_textfield_gameName')"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="pushed.TypeId"
                  :items="types"
                  item-value="Id"
                  item-text="Name"
                  :label="$t('game_management_select_type')"
                  solo
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="pushed.PlatformId"
                  :items="platforms"
                  item-value="Id"
                  item-text="SystemCode"
                  :label="$t('game_management_select_platform')"
                  solo
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="pushed.GameMode"
                  item-value="Id"
                  item-text="Name"
                  :items="gameModes"
                  :label="$t('game_management_select_mode')"
                  solo
                ></v-select>
              </v-col>
              <v-col xs12>
                <v-text-field
                  v-model.number="pushed.Order"
                  type="number"
                  :label="$t('game_management_textfield_order')"
                  :placeholder="$t('game_management_textfield_order_placeholder')"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeGames()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';

export default {
  name: 'Setting',
  components: {
    // 'vue-core-image-upload': VueCoreImageUpload,
  },
  data() {
    return {
      selectItem: 25,
      selectItems: [25, 50, 100],
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: '',
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
          lang: 'g_table_column_name',
          text: '名称',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'game_management_header_mode',
          text: '分成模式',
          value: '',
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
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      apis: [],
      types: [],
      platforms: [],
      pusheds: [],
      gameModes: [
        { Id: 1, Name: 'A' },
        { Id: 2, Name: 'B' },
        { Id: 3, Name: 'A+B' },
      ],
      infoBox: false,
      pushed: {
        Picture: '',
      },
      picError: false,
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
  },
  mounted() {
    this.loadData(1);
  },
  methods: {
    loadApis(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
      };
      api
        .get('/games/apis', params)
        .then(data => {
          this.apis = data.result;
          this.pagination.length = data.result.length / this.pagination.itemsPerPage;
          this.pagination.totalItems = data.result.length;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    loadTypes(p) {
      this.loading = true;
      api
        .get('/games/types')
        .then(data => {
          this.types = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
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
      api
        .get('/games/pusheds')
        .then(data => {
          this.pusheds = data.result;
          this.pagination.length = Math.ceil(data.result.length / this.pagination.itemsPerPage);
          this.pagination.totalItems = data.result.length;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addSetting() {
      this.loadApis();
      this.loadTypes();
      this.loadPlatforms();
      this.pushed = {
        Picture: '',
      };
      this.infoBox = true;
    },
    updateApi(item) {
      this.loadApis();
      this.loadTypes();
      this.loadPlatforms();
      this.pushed = item;
      this.infoBox = true;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '是否确认将此游戏配置停用',
        ok() {
          api
            .post(`/games/pushed/offline/${id}`, { status })
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
        text: '是否确认将此游戏配置启用',
        ok() {
          api
            .post(`/games/pushed/online/${id}`, { status })
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
    mergeGames() {
      const $this = this;
      if (this.$refs.form.validate()) {
        let url = '/games/pushed';
        if ($this.pushed.Id > 0) {
          url += `/${$this.pushed.Id}`;
        }
        api
          .post(url, this.pushed)
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
  },
};
</script>
