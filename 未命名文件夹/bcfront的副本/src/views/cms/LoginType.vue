<template>
  <div class="Logo">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template #activator="{ on: on1, attrs: attrs1 }">
          <v-btn v-bind="attrs1" color="primary" class="mx-2" depressed fab dark small v-on="on1" @click="addSpotlight()">
            <v-icon>add_photo_alternate</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_loginPage_addImage') }} </span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on: on2, attrs: attrs2 }">
          <v-btn v-bind="attrs2" color="primary" class="mx-2" depressed fab dark small v-on="on2" @click="postDataLoginData()">
            <v-icon>save</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_save') }}</span>
      </v-tooltip>
    </v-toolbar>

    <!-- 前台目录显示方式 PC Mobile -->
    <v-card elevation="0" class="ma-5 pa-5 rounded-lg" color="blue-grey lighten-4">
      <v-row dense class="align-center">
        <v-col>
          <h3>{{ $t('cms_loginPage_pcLoginLayout') }} ( 0 1 2 3 4 5 6 )</h3>
          <h3>{{ $t('cms_loginPage_mobileLoginLayout') }} ( 0 1 2 )</h3>
        </v-col>
        <template v-for="loginTypeItem in loginTypeArr">
          <v-col :key="loginTypeItem.key" class="d-flex align-center">
            <h2>{{ loginTypeKeyMap.get(loginTypeItem.key) }}</h2>
            <v-col> <v-text-field v-model="loginTypeItem.value" class="mx-1" solo dense hide-details></v-text-field></v-col>
          </v-col>
        </template>
      </v-row>
    </v-card>

    <v-container fluid class="pa-5">
      <v-row>
        <!-- 圖片列表 -->
        <template v-for="(imgItem, index) in imgArr">
          <v-col :key="imgItem.key" lg="6" xl="4">
            <v-card elevation="1" class="rounded-lg">
              <v-card-title class="pl-6">{{ imgKeyMap.get(imgItem.key) }}</v-card-title>
              <v-card-text>
                <v-row class="d-flex align-center justify-center">
                  <v-col cols="12">
                    <v-img v-if="imgItem.trace" class="mb-5" :src="imgItem.src" height="125" contain />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="px-5 pb-5">
                <v-spacer></v-spacer>
                <v-btn color="primary" depressed @click="removeImg(index)">{{ $t('cms_spotlight_delete') }}</v-btn>
                <v-btn color="secondary" depressed @click="readSpotlight(imgItem, index)">{{ $t('cms_spotlight_edit') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </v-container>
    <!-- 新增輪播圖彈窗 -->
    <v-dialog v-model="showInfoBox" persistent width="800px">
      <v-form ref="form" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">
              {{ spotlight.index === imgArr.length ? $t('cms_loginPage_editImage') : $t('cms_loginPage_addImage') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="showInfoBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('cms_loginPage_imageType') }}</v-label>
              </v-col>
              <v-col cols="10">
                <!-- <v-text-field v-model="spotlight.title" required type="text"> </v-text-field> -->
                <v-select v-model="spotlight.key" hide-details solo persistent-hint :items="vSelectItems"></v-select>
              </v-col>
              <!-- 圖片 -->
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label>{{ $t('g_btn_uploadImage') }}</v-label>
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
                  @imageuploaded="res => imageUploadedSpotlight(res)"
                  @errorhandle="imageError($event, 0)"
                >
                  <v-icon small right dark class="mr-2">cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="ml-3">{{ $t('cms_spotlight_pcPicRecomm') }}</small>
                <span v-show="spotlight.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
              </v-col>
              <v-col cols="12">
                <v-card>
                  <v-img v-if="spotlight.trace" :src="spotlight.src" height="200" max-width="100%" contain />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed @click="mergeSpotlight()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import { encodeConfigAPIValue, decodeConfigAPIValue, getConfigByCode, postConfigByCode } from '../../lib/configAPI.js';
import { separateArray } from '../../lib/common.js';

export default {
  name: 'LoginType',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
  },
  data() {
    return {
      loading: false,
      getConfigparams: {
        code: 'login_platform',
        used: 2,
      },
      setConfigparams: {
        code: 'login_platform',
        remark: '登入頁面參數',
        used: 2,
      },
      // new
      loginTypeKeyArr: [
        {
          key: 'PC_LOGIN_TYPE',
          title: this.$t('cms_loginPage_pcLoginLayout'),
        },
        {
          key: 'MOBILE_LOGIN_TYPE',
          title: this.$t('cms_loginPage_mobileLoginLayout'),
        },
      ],
      imgKeyArr: [
        {
          key: 'PC_LOGIN_BG_SRC',
          title: this.$t('cms_loginPage_pcLoginBg'),
        },
        {
          key: 'PC_LOGIN_LOGO_SRC',
          title: this.$t('cms_loginPage_pcLoginLogo'),
        },
        {
          key: 'PC_LOGIN_LEFT_IMG_SRC',
          title: this.$t('cms_loginPage_pcLoginLeftPic'),
        },
        {
          key: 'PC_LOGIN_TOP_IMG_SRC',
          title: this.$t('cms_loginPage_pcLoginTopPic'),
        },
        {
          key: 'PC_LOGIN_BOTTOM_RIGHT_IMG_SRC',
          title: this.$t('cms_loginPage_pcLoginBottomRightPic'),
        },
        {
          key: 'PC_LOGIN_COVOR_SRC',
          title: this.$t('cms_loginPage_pcLoginCoverPic'),
        },
        {
          key: 'MOBILE_LOGIN_BG_SRC',
          title: this.$t('cms_loginPage_mobileLoginBg'),
        },
        {
          key: 'MOBILE_LOGIN_LOGO_SRC',
          title: this.$t('cms_loginPage_mobileLoginLogo'),
        },
        {
          key: 'MOBILE_LOGIN_TOP_IMG_SRC',
          title: this.$t('cms_loginPage_mobileLoginTopPic'),
        },
      ],
      loginTypeArr: [
        // {
        //   key: '',
        //   title: '',
        //   value: '',
        // },
      ],
      imgArr: [
        // {
        //   key: '',
        //   src: '',
        //   picError: false,
        //   trace: false,
        // },
      ],
      spotlight: {
        src: '',
      },
      showInfoBox: false,
    };
  },
  computed: {
    ...mapGetters(['config']),
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
    loginTypeKeyMap() {
      return new Map(this.loginTypeKeyArr.map(element => [element.key, element.title]));
    },
    imgKeyMap() {
      return new Map(this.imgKeyArr.map(element => [element.key, element.title]));
    },
    vSelectItems() {
      return [
        { text: this.$t('cms_spotlight_choose'), value: null, disabled: true },
        ...[...this.imgKeyMap.entries()].map(([value, text]) => ({ text, value, disabled: this.disabledImgSet.has(value) })),
      ];
    },
    disabledImgSet() {
      return new Set(this.imgArr.map(element => element.key));
    },
  },
  mounted() {
    this.getLoginData();
  },
  methods: {
    /**
     * @param {String} key 登入頁面參數的key
     * @param {any} _keyValue 登入頁面參數的key
     * @return {Boolean}
     */
    saparateLoginTypeFunc([key, _keyValue]) {
      return this.loginTypeKeyMap.has(key);
    },
    // new
    createAPIParams() {
      const typeArr = this.loginTypeArr.map(({ key, value }) => [key, value]);
      const ImgArr = this.imgArr.map(({ key, src }) => [key, src]);
      const val = encodeConfigAPIValue(Object.fromEntries([...typeArr, ...ImgArr]));
      return { ...this.setConfigparams, val };
    },
    updateLoginTypeArr(loginTypeData) {
      if (loginTypeData.length === 0) {
        this.loginTypeArr = [...this.loginTypeKeyMap.entries()].map(([key, title]) => ({ key, value: 0 }));
      } else {
        this.loginTypeArr = loginTypeData.map(([key, dataValue]) => ({ key, value: dataValue }));
      }
    },
    updataImgArr(ImgArrData) {
      this.imgArr = ImgArrData.map(([key, dataValue]) => {
        const ImgData = { key, src: dataValue, picError: false, trace: false };
        return this.testImgCanUse(ImgData);
      });
    },
    getLoginData() {
      this.loading = true;
      getConfigByCode(this.getConfigparams)
        .then(data => {
          const { result = {} } = data;
          const ValData = decodeConfigAPIValue(result.Val);
          const [loginTypeData, othersData] = separateArray(Object.entries(ValData), this.saparateLoginTypeFunc);
          this.updateLoginTypeArr(loginTypeData);
          this.updataImgArr(othersData);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    postDataLoginData() {
      this.loading = true;
      const params = this.createAPIParams();
      postConfigByCode(params)
        .then(() => {
          this.$store.commit('MsgOk', this.$t('g_msgSaved'));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.getLoginData();
          this.loading = false;
        });
    },
    /**
     * @param {Object} obj 圖片資料
     * @param {Boolean} obj.trace 圖片是否可以使用
     * @param {String} obj.src 圖片位置
     * @return {Object} 檢查過的圖片資料，trace參數表示圖片可以使用
     */
    testImgCanUse(obj) {
      const testImgObject = new Image();
      obj.trace = false;
      testImgObject.onload = () => {
        obj.trace = true;
        obj.picError = false;
      };
      testImgObject.src = obj.src;
      return obj;
    },
    addSpotlight() {
      this.spotlight = {
        index: this.imgArr.length,
        key: null,
        src: '',
        picError: false,
        trace: false,
      };
      this.showInfoBox = true;
    },
    readSpotlight(data, index) {
      this.spotlight = { ...data, index };
      this.showInfoBox = true;
    },
    imageUploaded(res, index) {
      if (res.result) {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        const imgData = { ...this.imgArr[index], src: res.result[0] };
        const testImgData = this.testImgCanUse(imgData);
        this.$set(this.imgArr, index, testImgData);
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    imageUploadedSpotlight(res) {
      if (res.result) {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        const imgData = { ...this.spotlight, src: res.result[0] };
        const testImgData = this.testImgCanUse(imgData);
        this.spotlight = testImgData;
      } else {
        this.$store.commit('MsgError', res.error);
      }
    },
    removeImg(targetIndex) {
      this.imgArr = [...this.imgArr].filter((_, index) => index !== targetIndex);
    },
    mergeSpotlight() {
      if (this.spotlight.key === null) {
        return null;
      }
      if (this.imgArr.length === this.spotlight.index) {
        this.imgArr = [...this.imgArr, this.spotlight];
      } else {
        this.imgArr = this.imgArr.map((element, index) => (index === this.spotlight.index ? this.spotlight : element));
      }
      this.spotlight = {};
      this.showInfoBox = false;
    },
  },
};
</script>
