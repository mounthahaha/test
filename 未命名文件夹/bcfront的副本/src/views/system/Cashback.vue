<template>
  <div>
    <v-card>
      <v-toolbar class="elevation-0">
        <v-icon>settings</v-icon>
        <v-toolbar-title>返水配置</v-toolbar-title>
        返水百分比范围（0~5）
        <v-spacer></v-spacer>
        <v-switch v-model="status" :label="`${status ? '开启' : '关闭'}`" color="primary" @change="updateConfig"></v-switch>
      </v-toolbar>
      <v-card-text>
        <v-layout wrap>
          <v-flex v-for="(item, index) in cashbacks" :key="index" d-flex>
            <v-flex xs2>
              <v-text-field type="text" label="平台" :placeholder="platform[index]" :disabled="true"> </v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-text-field v-model.number="item.Percent" type="text" label="百分比" placeholder="所使用的编码"> </v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-text-field v-model.number="item.Max" type="text" label="最大返水" placeholder="配置的值"> </v-text-field>
            </v-flex>
            <v-flex xs1>
              <v-btn color="primary" depressed @click="updateCashback(index)"> 更新配置 </v-btn>
            </v-flex>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'Cashback',
  components: {},
  data() {
    return {
      cashbacks: {},
      platform: {},
      status: false,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  watch: {
    'config.cashback'(n) {
      this.status = n == 'true';
    },
  },
  mounted() {
    this.loadCashback();
  },
  methods: {
    loadCashback() {
      const $this = this;
      api
        .get('system/cashback')
        .then(data => {
          $this.cashbacks = data.result;
          $this.platform = data.platform;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    updateConfig() {
      const $this = this;
      const setting = {
        code: 'cashback',
        val: `${this.status}`,
        used: 5,
        remark: '返水开关',
      };
      api
        .post('system/config/cashback', setting)
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.$store.dispatch('CONFIGURE');
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    updateCashback(i) {
      const $this = this;
      api
        .post(`system/cashback/${this.cashbacks[i].Id}`, this.cashbacks[i])
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
