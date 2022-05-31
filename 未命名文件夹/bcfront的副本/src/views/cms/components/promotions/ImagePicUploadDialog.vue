<template>
  <v-dialog v-model="model" persistent width="1000px" :retain-focus="false">
    <v-overlay absolute :value="loading"></v-overlay>
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline">上传形象图</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <template #activator="{ on }">
          <v-btn icon v-on="on" @click.native="closeDialog">
            <v-icon>close</v-icon>
          </v-btn>
        </template>
      </v-menu>
    </v-toolbar>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card style="overflow: scroll" :loading="loading" height="500px" tile>
        <v-card-text v-if="!fetchLoading">
          <template v-for="(img, key) in images">
            <v-row :key="`title_${key}`">
              <v-col class="text-right" cols="2">
                <p class="mt-2">{{ img.text }}：</p>
              </v-col>
              <v-col :key="`img_btn${key}`" class="pb-0 mr-auto" :cols="10">
                <vue-core-image-upload
                  class="v-btn blue-grey white--text pa-3"
                  :crop="false"
                  :max-file-size="4096 * 4096"
                  text=""
                  url="/api/global/file"
                  :headers="uploadHeader"
                  @imageuploaded="imageUploaded($event, key)"
                >
                  上传图片
                  <v-icon right dark>cloud_upload</v-icon>
                </vue-core-image-upload>
                <small class="pl-4">{{ img.remark }}</small>
              </v-col>
              <v-col v-if="img.remoteStatus" :key="`preview_${key}`" cols="12">
                <v-img :lazy-src="inputPost[key]" aspect-ratio="1" contain height="300px"></v-img>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
      </v-card>
      <v-card tile>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="red lighten-1" color="error" outlined :loading="loading" @click="closeDialog">{{ !disabled ? '取消' : '离开' }}</v-btn>
          <v-btn color="primary" depressed :loading="loading" @click="submit">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import api from '@/api';
import VueCoreImageUpload from 'vue-core-image-upload';
import { GET_CMS_PROMOTION_IMAGEPIC, POST_CMS_PROMOTION_IMAGEPIC } from '@/api/Uri';
import dialog from '@/components/mixins/dialog.js';

export default {
  name: 'ImagePicUpload',
  components: {
    VueCoreImageUpload,
  },
  mixins: [dialog],
  data() {
    return {
      fetchLoading: false,
      inputPost: {
        pc: null,
        m: null,
      },
      images: {},
      initImages: {
        pc: {
          text: '电脑版形象图',
          remoteStatus: false,
          remark: '建议图片尺寸为：2536x500，1M以下。',
        },
        m: {
          text: '手机活动页',
          remoteStatus: false,
          remark: '建议图片尺寸为：1440x470，1M以下。',
        },
      },
    };
  },
  computed: {
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
  },
  watch: {
    model: {
      handler(val) {
        if (val) {
          this.init();
          this.getImagePic();
        }
      },
      immediate: true,
    },
  },
  methods: {
    init() {
      this.images = _.cloneDeep(this.initImages);
    },
    imageUploaded(res, type = 'pc') {
      if (res.result != '') {
        this.$store.commit('MsgOk', '上传图片成功');
        this.inputPost[type] = res.result[0];
        this.testImage(type);
      } else {
        _.$store.commit('MsgError', res.error);
      }
    },
    // 檢查圖片新的位置是有效
    testImage(type) {
      const tester = new Image();
      this.images[type].remoteStatus = false;
      tester.onload = () => {
        this.images[type].remoteStatus = true;
      };
      tester.src = this.inputPost[type];
    },
    async getImagePic() {
      this.fetchLoading = true;
      await api
        .get(GET_CMS_PROMOTION_IMAGEPIC.replace('{id}', 0))
        .then(response => {
          this.field = response.result;
          const formatedResult = this.field.reduce((acc, item) => {
            acc[item.Platform] = item.Path;
            return acc;
          }, {});
          this.inputPost = _.assignIn(this.inputPost, formatedResult);
          ['pc', 'm'].forEach(key => this.testImage(key));
          this.fetchLoading = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
          this.fetchLoading = false;
        });
    },
    submit() {
      this.loading = true;
      const post = this.inputPost;
      const postData = {
        pcimageurl: post.pc,
        mobileimageurl: post.m,
      };
      api
        .post(POST_CMS_PROMOTION_IMAGEPIC, postData)
        .then(data => {
          console.log(data);
          this.$store.commit('MsgOk', `修改成功`);
          this.updateDialog(true);
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>
