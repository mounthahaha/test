<template>
  <div class="Info">
    <v-container fluid class="pa-0 ma-0 pt-5">
      <v-toolbar elevation="1" class="pl-2">
        <v-spacer></v-spacer>
        <v-col cols="5">
          <v-select
            v-model="models"
            :placeholder="$t('player_detail_info_select_placeholder')"
            hide-details
            dense
            multiple
            :items="types"
            small
            solo
          ></v-select>
        </v-col>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1)">
              <v-icon>search</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('g_btn_search') }}</span>
        </v-tooltip>
      </v-toolbar>
      <v-card elevation="2" class="pa-5">
        <v-data-table
          :headers="headerComputed"
          :items="changed"
          :loading="loading"
          :disable-sort="loading"
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
          <template #body="{ items }">
            <tbody>
              <tr v-for="(item, index) in items" :key="`list_${index}`">
                <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
                <td class="text-left text-no-wrap">{{ item.note }}</td>
                <td class="text-left" style="max-width: 200px">
                  <code>{{ getSubtract(item.original, item.new) }}</code>
                </td>
                <td class="text-left text-no-wrap">{{ item.name }}</td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :disabled="loading" :length="pagination.length" :total-visible="15"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import { formatDate, money, hiddenPhoneNumber, hiddenText } from '../../filters/custom';
export default {
  name: 'Info',
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    player: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      loading: false,
      changed: [],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: ['created'],
        sortDesc: [true],
      },
      headers: [
        {
          lang: 'player_detail_changelog_headers_date',
          text: '日期',
          value: 'created',
          sortable: true,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_changelog_headers_change',
          text: '变化',
          value: 'note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_changelog_headers_content',
          text: '内容',
          value: 'original',
          width: '60%',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'player_detail_changelog_headers_name',
          text: '更新人',
          value: 'name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      logTypes: {},
      models: [],
    };
  },
  computed: {
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
    types() {
      return _.map(this.logTypes, (text, value) => ({
        text,
        value,
      }));
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
  created() {
    this.loadTypes();
    this.loadData(this.pagination.page);
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      this.pagination.page = p;
      this.loading = true;
      api
        .get(`/player/changed/${this.userId}`, {
          page: p,
          num: this.pagination.itemsPerPage,
          sort: this.pagination.sortBy[0],
          asc: !this.pagination.sortDesc[0],
          models: this.models.join(','),
        })
        .then(data => {
          this.changed = data.changed ?? [];
          this.pagination.length = data.pageNums;
          this.pagination.totalItems = data.total;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.loading = false;

          this.$store.commit('MsgError', error.error);
        });
    },
    loadTypes() {
      api
        .get('/system/userLogTypes')
        .then(resp => {
          this.logTypes = resp.result;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    // @todo 增加隱藏號碼 條件考慮抽共用 或者這東西應該在後端處理掉
    doHiddenPhone(val, key = '') {
      const isMobile = key.toString().toLocaleLowerCase() === 'mobile';
      // 20200513 乙棒說連admin都隱藏號碼
      // this.$store.state.user.user.name.indexOf('admin') === 0
      if (isNaN(val) || !isMobile) {
        return val;
      }

      return hiddenPhoneNumber(val);
    },
    doHiddenRealname(val, key = '') {
      return hiddenText(val);
    },
    getSubtract(unionArr, subsetArr) {
      const $this = this;
      const isJSON = str => {
        try {
          return JSON.parse(str) && !!str;
        } catch (e) {
          return false;
        }
      };
      if (subsetArr && isJSON(subsetArr) && JSON.parse(subsetArr)?.mobile) {
        const temp = JSON.parse(subsetArr);
        // !temp?.mobile || (temp.mobile = this.doHiddenPhone(temp.mobile, 'mobile'));
        // !temp?.Mobile || (temp.Mobile = this.doHiddenPhone(temp.Mobile, 'Mobile'));
        // !temp?.name || (temp.name = this.doHiddenRealname(temp.name, 'name'));
        subsetArr = JSON.stringify(temp);
      }
      // @todo omega 重構吧你 寫這髒code
      if (unionArr == '') {
        return subsetArr;
      }
      try {
        const ret = {};
        const old = JSON.parse(unionArr);
        const nw = JSON.parse(subsetArr);

        for (const i in old) {
          if (nw[i] != old[i]) {
            if (i == 'Tags') {
              let oldstr = '';
              let nwstr = '';
              if (old[i] != '') {
                const ot = old[i].split(',');
                for (const x in ot) {
                  if ($this.tags[ot[x]]) {
                    oldstr += `${$this.tags[ot[x]].name},`;
                  } else {
                    oldstr += `${ot[x]},`;
                  }
                }
              }
              if (nw[i] != '') {
                const nt = nw[i].split(',');
                for (const xx in nt) {
                  if ($this.tags[nt[xx]]) {
                    nwstr += `${$this.tags[nt[xx]].name},`;
                  } else {
                    nwstr += `${nt[xx]},`;
                  }
                }
              }
              ret[i] = {
                Old: this.doHiddenPhone(oldstr, i),
                New: this.doHiddenPhone(nwstr, i),
              };
            } else {
              ret[i] = {
                Old: this.doHiddenPhone(old[i], i),
                New: this.doHiddenPhone(nw[i], i),
              };
            }
          }
        }
        return ret;
      } catch (e) {
        return subsetArr;
      }
    },
  },
};
</script>
