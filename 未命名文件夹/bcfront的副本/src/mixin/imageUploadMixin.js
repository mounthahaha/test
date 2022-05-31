import { mapActions, mapGetters } from 'vuex';

export default {
  // 為了防止使用mixins時設定沖突，名稱請加上'imageUpload'當前綴
  methods: {
    /**
     * 檢查圖片資料
     * @param {Object} obj 圖片資料
     * @param {Boolean} obj.trace 圖片是否可以使用
     * @param {String} obj.src 圖片位置
     * @return {Object} 檢查過的圖片資料，trace參數表示圖片可以使用
     */
    imageUploadTest(obj) {
      const testImgObject = new Image();
      obj.trace = false;
      testImgObject.onload = () => {
        obj.trace = true;
        obj.picError = false;
      };
      testImgObject.src = obj.src;
      return obj;
    },
    /**
     * 圖片上傳後函式，把回傳的圖片UML設定入資料
     * @param {Object} res 回呼response
     * @param {Object} data 圖片的資料
     * @returns {{src: String}} 圖片的資料
     */
    imageUploadData(res, data) {
      if (res.result) {
        this.$store.commit('MsgOk', this.$t('cms_spotlight_msg_uploadPicSuccess'));
        const imgData = { ...data, src: res.result[0] };
        const testImgData = this.imageUploadTest(imgData);
        return testImgData;
      } else {
        this.$store.commit('MsgError', res.error);
        return data;
      }
    },
    /**
     * 圖片錯誤訊息函式，顯示錯誤訊息
     * @param {Object} res 回呼response
     * @param {Boolean} data 圖片的資料
     * @returns {Void}
     */
    imageUploadError(error) {
      const isSizeExceed = /FILE IS TOO LARGER/gi.test(error);
      this.$store.commit('MsgError', isSizeExceed ? this.$t('cms_spotlight_msg_fileToBig1M') : '');
    },
  },
};
