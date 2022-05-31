<template>
  <div class="Configure">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增配置-->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="infoBox = true">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>新增配置</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card :loading="loading" elevation="2" class="pa-10 rounded-lg">
        <v-layout wrap>
          <v-flex v-for="(item, index) in settings" :key="index" class="d-flex align-center">
            <v-flex xs1>
              <v-subheader class="font-weight-bold ml-5"> {{ item.Id }}. </v-subheader>
            </v-flex>
            <v-flex xs2>
              <v-text-field
                v-model="item.Remark"
                type="text"
                :label="$t('system_configure_name')"
                :placeholder="$t('system_configure_placeholder_briefIntroduction')"
              >
              </v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-text-field v-model="item.Code" type="text" label="key" :placeholder="$t('system_configure_placeholder_encoding')"> </v-text-field>
            </v-flex>
            <v-flex xs4>
              <v-text-field v-model="item.Val" type="text" label="value" :placeholder="$t('system_configure_placeholder_confValue')"> </v-text-field>
            </v-flex>
            <v-flex xs3 class="text-no-wrap d-flex align-center">
              <v-flex>
                <v-checkbox v-model="item.use" :label="$t('system_configure_front')" color="primary" value="2" hide-details></v-checkbox>
              </v-flex>
              <v-flex>
                <v-checkbox v-model="item.use" :label="$t('system_configure_agency')" color="primary" value="4" hide-details></v-checkbox>
              </v-flex>
              <v-flex>
                <v-checkbox v-model="item.use" :label="$t('system_configure_system')" color="primary" value="1" hide-details></v-checkbox>
              </v-flex>
              <v-flex class="text-no-wrap d-flex align-center">
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
                      @click="updateConfig(index)"
                    >
                      <v-icon>save</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('system_configure_updateConfig') }}</span>
                </v-tooltip>
              </v-flex>
            </v-flex>
          </v-flex>
        </v-layout>
      </v-card>
    </v-container>

    <v-dialog v-model="infoBox" persistent width="40%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-5">{{ $t('system_configure_insertConfig') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="setting.Remark"
                  type="text"
                  :label="$t('system_configure_name')"
                  :placeholder="$t('system_configure_placeholder_briefIntroduction')"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="setting.Code"
                  type="text"
                  label="key"
                  :rules="[v => !!v || $t('system_configure_rules_key')]"
                  :placeholder="$t('system_configure_placeholder_encoding')"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="setting.Val"
                  type="text"
                  label="value"
                  :rules="[v => !!v || $t('system_configure_rules_value')]"
                  :placeholder="$t('system_configure_placeholder_confValue')"
                >
                </v-text-field>
              </v-col>
              <v-col cols="8">
                <v-row>
                  <v-col shrink>
                    <v-checkbox v-model="setting.use" :label="$t('system_configure_front')" color="primary" value="2"></v-checkbox>
                  </v-col>
                  <v-col shrink>
                    <v-checkbox v-model="setting.use" :label="$t('system_configure_agency')" color="primary" value="4"></v-checkbox>
                  </v-col>
                  <v-col shrink>
                    <v-checkbox v-model="setting.use" :label="$t('system_configure_system')" color="primary" value="1"></v-checkbox>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="addConfig()"> {{ $t('g_btn_confirm') }} </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'Configure',
  components: {},
  data() {
    return {
      loading: false,
      valid: true,
      settings: [],
      setting: {
        use: [],
      },
      infoBox: false,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    loadConfig() {
      const $this = this;
      api
        .get('system/configs')
        .then(data => {
          data.result.forEach(v => {
            v.use = [];
            for (const i of [1, 2, 4]) {
              if ((v.Used & i) !== 0) {
                v.use.push(`${i}`);
              }
            }
          });
          $this.settings = data.result;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    addConfig() {
      this.loading = true;
      const $this = this;
      if (this.$refs.form.validate()) {
        let used = 0;
        if ($this.setting.use.length > 0) {
          $this.setting.use.forEach(v => {
            used += parseInt(v);
          });
        }
        $this.setting.Used = used;
        api
          .post('system/config', $this.setting)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadConfig();
            $this.setting = {
              use: [],
            };
            $this.infoBox = false;
            $this.loading = false;
          })
          .catch(error => {
            $this.loading = false;
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
    updateConfig(i) {
      const $this = this;
      const setting = $this.settings[i];
      let used = 0;
      if (setting.use.length > 0) {
        setting.use.forEach(v => {
          used += parseInt(v);
        });
      }
      setting.Used = used;
      api
        .post('system/configUpdateById', setting)
        .then(data => {
          $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          $this.loadConfig();
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
