<template>
  <v-app id="inspire">
    <v-main>
      <v-container fluid fill-height style="max-width: 1200px" class="Login">
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-0 rounded-xl" style="background: rgba(0%, 0%, 0%, 0)">
              <v-icon x-large dark class="d-flex justify-center pt-10 pb-5">login</v-icon>
              <h1 class="d-flex justify-center white--text">LOGIN</h1>
              <!-- <v-toolbar class="d-flex justify-center elevation-0" dark color="primary">
                <v-icon class="mr-5" large>public</v-icon>
                <v-toolbar-title>ADMIN SYSTEM</v-toolbar-title>
              </v-toolbar> -->
              <v-card-text class="pa-10">
                <v-form>
                  <v-text-field
                    v-model="RegName"
                    :error-messages="nameError"
                    prepend-icon="person"
                    :label="$t('login_label_enterAccount')"
                    outlined
                    required
                    dark
                  ></v-text-field>
                  <v-text-field
                    v-model="Passwd"
                    :error-messages="passwordError"
                    prepend-icon="lock"
                    :append-icon="PasswdShow ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="PasswdShow ? 'text' : 'password'"
                    :label="$t('login_label_enterPassword')"
                    required
                    outlined
                    dark
                    @click:append="PasswdShow = !PasswdShow"
                    @keyup.enter="login"
                  ></v-text-field>
                  <v-text-field
                    v-show="showCode || qr != ''"
                    v-model="Code"
                    prepend-icon="lock"
                    :label="$t('login_label_enterGoogleCode')"
                    type="text"
                    dark
                    @keyup.enter="login"
                  ></v-text-field>
                  <v-flex v-if="qr != ''" xs12>
                    <v-card dark>
                      <v-img :src="qr" max-height="125" contain></v-img>
                      <v-card-title class="subheading">{{ $t('login_tips_googleVaildator') }}</v-card-title>
                    </v-card>
                  </v-flex>
                  <v-select
                    v-model="langModel"
                    prepend-icon="mdi-web"
                    type="text"
                    :label="$t('g_selector_language')"
                    :items="langItem"
                    item-text="value"
                    item-value="key"
                    outlined
                    dark
                    @change="changeLang"
                  >
                  </v-select>
                </v-form>
                <v-card-actions class="d-flex align-center justify-center px-0 mt-5">
                  <v-btn
                    class="elevation-0"
                    block
                    rounded
                    depressed
                    color="white"
                    :text="loading"
                    :loading="loading"
                    :disabled="loading"
                    @click="login"
                  >
                    {{ $t('g_login') }}
                    <span slot="loader" class="white--text">{{ $t('g_logging') }}...</span>
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </v-flex>
          <div class="login-scheme-right">
            <img src="../assets/login-scheme-left.svg" />
          </div>
        </v-layout>
      </v-container>

      <v-footer dense dark padless absolute transparent>
        <v-card class="footer-background flex py-1 ma-0 white--text text-center" flat tile>
          <v-card-text class="pa-0 ma-0">
            Copyright © 测试{{ new Date().getFullYear() }}
            <strong>Admin System {{ packageVersion.GIT_TAG }} {{ packageVersion.GIT_COMMITHASH.slice(1, 9) }}, </strong>
            <strong>API v{{ version }}, </strong><strong>{{ formatDate(packageVersion.DEPLOY_TIME) }} </strong>All rights reserved.
          </v-card-text>
        </v-card>
      </v-footer>
    </v-main>
    <vue-particles
      class="particles"
      color="#fff"
      :particle-opacity="0.2"
      :particles-number="50"
      shape-type="star"
      :particle-size="3"
      lines-color="#fff"
      :lines-width="1"
      :line-linked="false"
      :line-opacity="1"
      :lines-distance="200"
      :move-speed="1"
      :hover-effect="true"
      :click-effect="true"
      hover-mode="push"
      click-mode="push"
    >
    </vue-particles>
  </v-app>
</template>
<script>
import api from '@/api';
import { mapGetters, mapMutations } from 'vuex';
import { formatDate } from '@/filters/custom';
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      RegName: '',
      nameError: [],
      Passwd: '',
      passwordError: [],
      PasswdShow: false,
      qr: '',
      showCode: false,
      Code: '',
      langModel: 'en',
      gitCommitHash: process.env.VUE_APP_GIT_COMMITHASH,
      tag: process.env.VUE_APP_GIT_TAG,
    };
  },
  computed: {
    ...mapGetters({ locale: 'i18n/locale', langItem: 'i18n/langItem', version: 'version', packageVersion: 'packageVersion' }),
    loginBox() {
      return this.$store.getters.modalBox === this.$options.name;
    },
  },
  watch: {
    RegName() {
      this.nameError = [];
      this.passwordError = [];
    },
    Passwd() {
      this.nameError = [];
      this.passwordError = [];
    },
  },
  created() {
    this.langModel = this.locale;
  },
  methods: {
    ...mapMutations({ SET_LOCALE: 'i18n/SET_LOCALE' }),
    formatDate,
    login() {
      if (this.RegName == '') {
        this.nameError.push(this.$t('login_message_accountRequired'));
        return false;
      }
      if (this.Passwd == '') {
        this.passwordError.push(this.$t('login_message_passwordRequired'));
        return false;
      }
      const $this = this;
      $this.loading = true;
      api
        .post('login', {
          Name: this.RegName,
          Passwd: this.Passwd,
          Code: this.Code,
        })
        .then(res => {
          $this.$store.commit('ShowGlobal', '');
          if (res.result.qr) {
            $this.qr = res.result.qr;
            $this.$store.commit('MsgError', this.$t('login_message_bindGoogle'));
          } else if (res.result.show) {
            $this.showCode = true;
          } else {
            $this.$store.commit('onUserLogin', res.result);
            $this.$store.commit('MsgOk', this.$t('g_msgOk'));
          }
          $this.loading = false;
          $this.$store.dispatch('CONFIGURE');
        })
        .catch(error => {
          $this.loading = false;
          $this.nameError.push(error.error);
          $this.passwordError.push(error.error);
          $this.$store.commit('MsgError', error.error);
        });
      return false;
    },
    changeLang(lang) {
      this.SET_LOCALE(lang);
    },
  },
};
</script>
<style lang="scss">
#inspire {
  background-color: rgb(245, 245, 245);
  z-index: 3;
}
.particles {
  width: 100%;
  height: calc(100% - 10px);
  position: fixed;
  z-index: -1;
  background-color: black;
  // background: rgb(17, 121, 209);
  // background: radial-gradient(circle, rgba(17, 121, 209, 1) 33%, rgba(56, 87, 136, 1) 100%);
}
.login-scheme-right {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 1;
  display: inline-block;
  width: 20%;
  transform: rotateY(180deg);
}
.footer-background {
  background-color: black !important;
  // background: radial-gradient(circle, rgba(17, 121, 209, 1) 33%, rgba(56, 87, 136, 1) 100%);
}
.Login {
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    transition: background-color 50000s ease-in-out 0s;
    -webkit-text-fill-color: #fff !important;
    color: #000 !important;
  }
}
</style>
