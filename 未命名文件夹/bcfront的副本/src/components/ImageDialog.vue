<template>
  <v-dialog :value="value" persistent width="800px" @input="closeDialog">
    <v-form ref="form" lazy-validation>
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2">
            {{ imageData.src ? '编辑图片' : '新增图片' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="closeDialog"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap>
            <!-- 圖片 -->
            <v-col cols="2" class="d-flex align-center justify-center">
              <v-icon small color="red" class="mr-1">star</v-icon>
              <v-label>上传图片</v-label>
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
                @imageuploaded="imageUpdateEvent"
                @errorhandle="imageError($event, 0)"
              >
                <v-icon small right dark class="mr-2">cloud_upload</v-icon>
              </vue-core-image-upload>
              <small class="ml-3">{{ $t('cms_spotlight_pcPicRecomm') }}</small>
              <span v-show="imageData.picError" class="red--text ml-3">{{ $t('cms_spotlight_plzUpload') }}</span>
            </v-col>
            <v-col cols="12">
              <v-card>
                <v-img v-if="imageData.trace" :src="imageData.src" height="200" max-width="100%" contain />
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn v-if="showDelectBtn" color="primary" depressed @click="deleteEvent"> {{ $t('cms_spotlight_delete') }}</v-btn>
          <v-btn color="secondary" depressed @click="editEvent"> {{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import VueCoreImageUpload from 'vue-core-image-upload';
import imageUploadMixin from '../mixin/imageUploadMixin.js';
// 圖片新增編輯彈窗
export default {
  name: 'ImageDialog',
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
  },
  mixins: [imageUploadMixin],
  props: {
    // 彈窗專用參數，用來和v-modal組合
    value: {
      type: Boolean,
      default: false,
    },
    startImageData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      imageData: {},
    };
  },
  computed: {
    // 上傳圖片必須的參數
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
    // 只有在編輯圖片時才出現
    showDelectBtn() {
      return Boolean(this.startImageData.src);
    },
  },
  watch: {
    value(newValue, oldValue) {
      // 彈窗打開時，把圖片的資料更新，新增圖片時，自動寫入pictureKey
      if (newValue) {
        if (this.startImageData.src) {
          this.imageData = this.startImageData;
        } else {
          this.imageData = { ...this.startImageData, pictureKey: `${this.startImageData.pictureIndex}` };
        }
      }
    },
  },
  methods: {
    // 彈窗專用事件，用來和v-modal組合
    closeDialog() {
      return this.$emit('input', false);
    },
    imageUpdateEvent(res) {
      this.imageData = this.imageUploadData(res, this.imageData);
    },
    imageErrorevent(error) {
      this.imageUploadError(error);
    },
    deleteEvent() {
      this.closeDialog();
      this.$emit('deleteImage', this.imageData);
    },
    editEvent() {
      if (this.imageData.src && this.imageData.src !== '') {
        this.closeDialog();
        this.$emit('editImage', this.imageData);
      }
    },
  },
};
</script>

<style></style>
