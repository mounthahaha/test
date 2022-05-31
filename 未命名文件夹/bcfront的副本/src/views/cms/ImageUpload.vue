<template>
  <div class="ImageUpload">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-container fluid class="pa-5">
      <!-- logo Favicon APP Install Download -->
      <v-row>
        <v-col lg="6" xl="4">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="pl-6"> PC Logo </v-card-title>
            <v-card-text>
              <v-row class="d-flex align-center justify-center">
                <v-col cols="12">
                  <v-img v-if="logoPC.trace" class="mb-5" :src="logoPC.src" height="125" contain />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center justify-center">
                <vue-core-image-upload
                  ref="uploaderPc"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedLogoPC"
                  @errorhandle="imageError($event, 0)"
                >
                  <v-icon right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_pcPicRecomm') }}</small>
                <span v-show="logoPC.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-5 pb-5">
              <v-spacer></v-spacer>
              <v-btn color="primary" depressed :loading="loading" @click="save('/cms/logo-pc', logoPC.src)"> {{ $t('g_btn_save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col lg="6" xl="4">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="pl-6"> Mobile Logo </v-card-title>
            <v-card-text>
              <v-row class="d-flex align-center justify-center">
                <v-col cols="6">
                  <v-img v-if="logoMobile.trace" class="mb-5" :src="logoMobile.src" height="125" contain />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center justify-center">
                <vue-core-image-upload
                  ref="uploaderMobile"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedLogoMobile"
                  @errorhandle="imageError($event, 1)"
                >
                  <v-icon right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_mobildPicRecomm') }}</small>
                <span v-show="logoMobile.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-5 pb-5">
              <v-spacer></v-spacer>
              <v-btn color="primary" depressed :loading="loading" @click="save('/cms/logo-mobile', logoMobile.src)"> {{ $t('g_btn_save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col lg="6" xl="4">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="pl-6"> Favicon </v-card-title>
            <v-card-text>
              <v-row class="d-flex align-center justify-center">
                <v-col cols="12">
                  <v-img v-if="favicon.trace" class="mb-5" :src="favicon.src" height="125" contain />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center justify-center">
                <vue-core-image-upload
                  ref="uploaderFavicon"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedFavicon"
                  @errorhandle="imageError($event, 1)"
                >
                  <v-icon right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_mobildPicRecomm') }}</small>
                <span v-show="favicon.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-5 pb-5">
              <v-spacer></v-spacer>
              <v-btn color="primary" depressed :loading="loading" @click="save('/cms/favicon', favicon.src)"> {{ $t('g_btn_save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col lg="6" xl="4">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="pl-6"> AppDownload </v-card-title>
            <v-card-text>
              <v-row class="d-flex align-center justify-center">
                <v-col cols="12">
                  <v-img v-if="appDownloadPage.trace" class="mb-5" :src="appDownloadPage.src" height="125" contain />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center justify-center">
                <vue-core-image-upload
                  ref="uploaderAppDownloadPage"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedAppDownloadPage"
                  @errorhandle="imageError($event, 0)"
                >
                  <v-icon right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_downloadPageRecomm') }}</small>
                <span v-show="appDownloadPage.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-5 pb-5">
              <v-spacer></v-spacer>
              <v-btn color="primary" depressed :loading="loading" @click="save('/cms/appDownloadPage', appDownloadPage.src)">
                {{ $t('g_btn_save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col lg="6" xl="4">
          <v-card elevation="1" class="rounded-lg">
            <v-card-title class="pl-6"> InstallDownload </v-card-title>
            <v-card-text>
              <v-row class="d-flex align-center justify-center">
                <v-col cols="6">
                  <v-img v-if="installDownloadPage.trace" class="mb-5" :src="installDownloadPage.src" height="125" contain />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center justify-center">
                <vue-core-image-upload
                  ref="uploaderInstallDownloadPage"
                  class="v-btn blue-grey white--text pa-1"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageuploadedInstallDownloadPage"
                  @errorhandle="imageError($event, 1)"
                >
                  <v-icon right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_downloadPageRecomm') }}</small>
                <span v-show="installDownloadPage.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-5 pb-5">
              <v-spacer></v-spacer>
              <v-btn color="primary" depressed :loading="loading" @click="save('/cms/installDownloadPage', installDownloadPage.src)">
                {{ $t('g_btn_save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';

export default {
  name: 'Logo',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
  },
  data() {
    return {
      loading: false,
      logoPC: {
        src: '',
        picError: false,
        trace: false,
      },
      logoMobile: {
        src: '',
        picError: false,
        trace: false,
      },
      favicon: {
        src: '',
        picError: false,
        trace: false,
      },
      appDownloadPage: {
        src: '',
        picError: false,
        trace: false,
      },
      installDownloadPage: {
        src: '',
        picError: false,
        trace: false,
      },
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
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      api
        .get('/cms/logo')
        .then(data => {
          this.logoPC.src = data.result.logoPC;
          this.logoMobile.src = data.result.logoMobile;
          this.favicon.src = data.result.favicon;
          this.appDownloadPage.src = data.result.appDownloadPage;
          this.installDownloadPage.src = data.result.installDownloadPage;
          this.testImageLogoPC(this.logoPC);
          this.testImageLogoMobile(this.logoMobile);
          this.testImageFavicon(this.favicon);
          this.testImageAppDownloadPage(this.appDownloadPage);
          this.testImageInstallDownloadPage(this.installDownloadPage);
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    save(url, data) {
      api
        .put(url, { Val: data })
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
          this.loadData();
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    imageuploadedLogoPC(res) {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        this.logoPC.src = res.result[0];
        this.testImageLogoPC(this.logoPC);
        this.logoPC.picError = false;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedLogoMobile(res) {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        this.logoMobile.src = res.result[0];
        this.testImageLogoMobile(this.logoMobile);
        this.logoMobile.picError = false;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedFavicon(res) {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        this.favicon.src = res.result[0];
        this.testImageFavicon(this.favicon);
        this.favicon.picError = false;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedAppDownloadPage(res) {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        this.appDownloadPage.src = res.result[0];
        this.testImageAppDownloadPage(this.appDownloadPage);
        this.appDownloadPage.picError = false;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageuploadedInstallDownloadPage(res) {
      if (res.result != '') {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        this.installDownloadPage.src = res.result[0];
        this.testImageInstallDownloadPage(this.installDownloadPage);
        this.installDownloadPage.picError = false;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    testImageLogoPC(obj) {
      const testerLogoPC = new Image();
      obj.trace = false;
      testerLogoPC.onload = () => {
        obj.trace = true;
      };
      testerLogoPC.src = obj.src;
    },
    testImageLogoMobile(obj) {
      const testerLogoMobile = new Image();
      obj.trace = false;
      testerLogoMobile.onload = () => {
        obj.trace = true;
      };
      testerLogoMobile.src = obj.src;
    },
    testImageFavicon(obj) {
      const testerFavicon = new Image();
      obj.trace = false;
      testerFavicon.onload = () => {
        obj.trace = true;
      };
      testerFavicon.src = obj.src;
    },
    testImageAppDownloadPage(obj) {
      const testerAppDownloadPage = new Image();
      obj.trace = false;
      testerAppDownloadPage.onload = () => {
        obj.trace = true;
      };
      testerAppDownloadPage.src = obj.src;
    },
    testImageInstallDownloadPage(obj) {
      const testerInstallDownloadPage = new Image();
      obj.trace = false;
      testerInstallDownloadPage.onload = () => {
        obj.trace = true;
      };
      testerInstallDownloadPage.src = obj.src;
    },
    imageError(error, index) {
      document.querySelectorAll('input[type=file]')[index].value = '';
      const isSizeExceed = /FILE IS TOO LARGER/gi.test(error);
      this.$store.commit('MsgError', isSizeExceed ? this.$t('cms_spotlight_msg_fileToBig1M') : '');
    },
  },
};
</script>
