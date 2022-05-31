<template>
  <div class="FriendsSetting">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="add()">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_add') }}</span>
      </v-tooltip>
    </v-toolbar>

    <!-- 出入金示警设置 -->
    <v-card class="ma-5 px-5 pt-2 pb-5 rounded-lg">
      <v-progress-linear :active="loading" color="blue" indeterminate />
      <v-card-text>
        <v-list>
          <v-list-item v-for="(item, i) in settings" :key="i" class="d-flex flex-wrap">
            <hr v-if="i > 0" class="my-2" style="width: 100%; border-top-color: grey" />
            <div>
              好友首存
              <v-text-field
                v-if="item.editing"
                v-model.number="item.amount"
                type="number"
                class="d-inline-block mx-1"
                dense
                hide-details
                solo
                required
                :rules="[v => !!v || '請填入數字']"
              />
              <template v-else>{{ item.amount }}</template>
              以上，获得红包
              <v-text-field
                v-if="item.editing"
                v-model.number="item.bonus"
                type="number"
                class="d-inline-block mx-1"
                dense
                hide-details
                solo
                required
                :rules="[v => !!v || '請填入數字']"
              />
              <template v-else>{{ item.bonus }}</template>
              元
            </div>
            <v-spacer />
            <div class="text-right">
              <v-btn v-if="!item.editing" class="d-inline-block" icon @click="edit(i)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn v-else class="d-inline-block" icon @click="save(i)"><v-icon>save</v-icon></v-btn>
              <v-btn class="d-inline-block" icon @click="del(i)">
                <v-icon>delete</v-icon>
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from '@/api';
import { getConfigByCode, postConfigByCode } from '../../lib/configAPI.js';
export default {
  name: 'Settings',
  components: {},
  data() {
    return {
      loading: false,
      readonly: false,
      settings: null,
      strVal: '',
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  watch: {},
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.loading = true;
      getConfigByCode({ code: 'Red_envelope' })
        .then(r => {
          this.loading = false;
          if (/^[{]/.test(r.result?.Val)) {
            this.settings = JSON.parse(JSON.parse(r.result?.Val || '{}').Val || '[]').map(item => ({ ...item, editing: false }));
          } else {
            this.settings = JSON.parse(r.result?.Val || '[]').map(item => ({ ...item, editing: false }));
          }
        })
        .catch(error => {});
    },
    edit(index) {
      this.settings.forEach((item, i) => {
        item.editing = i == index;
      });
    },
    save(i) {
      if (this.loading) {
        return;
      }
      this.loading = true;

      const val = JSON.stringify(
        this.settings.map(item => {
          const { amount, bonus } = item;
          return { amount, bonus };
        }),
      );
      postConfigByCode({ code: 'Red_envelope', used: 2, val })
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          if (i != undefined) {
            this.settings[i].editing = false;
          }
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
          this.refresh();
        });
    },
    add() {
      this.settings.forEach(item => (item.editing = false));
      this.settings = [
        {
          bonus: undefined,
          amount: undefined,
          editing: true,
        },
        ...this.settings,
      ];
    },
    del(i) {
      this.$store.commit('Confirm', {
        text: this.$t('g_msg_sureDo'),
        ok: () => {
          this.settings.splice(i, 1);
          this.save();
        },
      });
    },
  },
};
</script>
<style lang="scss">
.FriendsSetting .v-input {
  max-width: 4em;
  width: 4em;
}
</style>
