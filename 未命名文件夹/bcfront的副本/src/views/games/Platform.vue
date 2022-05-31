<template>
  <div class="Platform">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> sports_soccer </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增游戏平台 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addPlatform">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增游戏平台</span>
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
          :items="GamePlatforms"
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
                    <v-btn icon color="primary" v-bind="attrs" @click="updatePlatforms(item)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="offline(item.Id)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>
                <!-- <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn v-if="item.Deleted == false" icon color="primary" v-bind="attrs" @click="offline(item.Id)" v-on="on">
                      <v-icon>do_not_disturb_on</v-icon>
                    </v-btn>
                    <v-btn v-else icon color="primary" v-bind="attrs" @click="online(item.Id)" v-on="on">
                      <v-icon>add_circle</v-icon>
                    </v-btn>
                  </template>
                  <span v-if="item.Deleted == false">{{ $t('g_btn_disable') }}</span>
                  <span v-else>{{ $t('g_btn_enable') }}</span>
                </v-tooltip> -->
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.Deleted ? `red` : `green`">
                  {{ item.Deleted ? $t('g_btn_disable') : $t('g_btn_enable') }}
                </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Id }}</td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="primary"> {{ item.SystemCode }} </v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.Note }}</td>
              <td class="text-left text-no-wrap">
                <template v-if="item.Fee > 0"> {{ item.Fee }} % </template>
                <template v-else> {{ $t('g_btn_none') }} </template>
              </td>
              <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
            </tr>
          </template>
        </v-data-table>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <!-- <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div> -->
        </div>
      </v-card>
    </v-container>

    <!-- 新增游戏平台彈窗-->
    <v-dialog v-model="infoBox" persistent width="500px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">{{ $t('game_platform_btn_addNew') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row dense wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="platform.SystemCode"
                  type="text"
                  :label="$t('game_platform_textfield_gameName')"
                  :placeholder="$t('game_platform_textfield_gameName')"
                  :rules="[v => !!v || $t('game_platform_msg_gameName')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="platform.Fee"
                  suffix="%"
                  type="text"
                  :label="$t('game_platform_headers_fee')"
                  :placeholder="$t('game_platform_headers_fee')"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="platform.Note"
                  type="text"
                  :label="$t('g_table_column_remarks')"
                  :placeholder="$t('g_table_column_remarks')"
                  :rules="[v => !!v || $t('g_msgRemark')]"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeApi()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import api from '@/api';

export default {
  name: 'Announcement',
  components: {},
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
          lang: 'g_table_column_remarks',
          text: '备注',
          value: '',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'game_platform_headers_fee',
          text: '平台费',
          value: '',
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
      GamePlatforms: [],
      infoBox: false,
      platform: {},
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
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadPlatforms(n);
    },
    // selectItem(newVal) {
    //   this.pagination.itemsPerPage = newVal;
    //   this.pagination.page = 1;
    //   this.loadPlatforms(this.pagination.page);
    // },
  },
  mounted() {
    this.loadPlatforms(1);
  },
  methods: {
    loadPlatforms(p) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {
        page: this.pagination.page,
        num: this.pagination.itemsPerPage,
      };
      api
        .get('/games/platforms', params)
        .then(data => {
          this.GamePlatforms = data.result;
          this.pagination.length = Math.ceil(data.result.length / this.pagination.itemsPerPage);
          this.pagination.totalItems = data.result.length;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addPlatform() {
      this.platform = {};
      this.infoBox = true;
    },
    updatePlatforms(item) {
      this.platform = item;
      this.infoBox = true;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '是否确认将此游戏平台删除',
        ok() {
          api
            .post(`/games/platform/offline/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadPlatforms(1);
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
        text: '是否确认将此游戏平台启用',
        ok() {
          api
            .post(`/games/platform/online/${id}`, { status })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadPlatforms(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    mergeApi() {
      const $this = this;
      if (this.$refs.form.validate()) {
        let url = '/games/platform';
        if ($this.platform.Id > 0) {
          url += `/${$this.platform.Id}`;
        }
        api
          .post(url, this.platform)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadPlatforms();
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
