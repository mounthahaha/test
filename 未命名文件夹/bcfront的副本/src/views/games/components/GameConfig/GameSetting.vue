<template>
  <div class="game-setting">
    <div class="content">
      <div style="display:flex;justify-content:space-between;pading:10px 0;align-items:center;">
        <h2 class="title">前台游戏配置</h2>
        <!-- <el-button type="primary"  @click="editHandle" icon="el-icon-plus"></el-button> -->
      </div>
      <el-table v-loading="gameLoading" border ref="table" :data="gameList">
        <el-table-column prop="sort" label="排序" />
        <el-table-column prop="game_name" label="游戏名称" />
        <el-table-column prop="sub_title" label="副标名称" />
        <el-table-column prop="content" label="游戏内文" width="400" />
        <el-table-column prop="offer_desc" label="优惠说明" />
        <el-table-column prop="title_logo" label="Titl_logo" width="150">
          <template #default="{row}">
            <el-image :preview-src-list="[row.title_logo]" :src="row.title_logo"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="pic_big_pc" label="Pic_Big_PC" width="300">
          <div class="img-list" slot-scope="{row}">
            <el-image v-for="(src, key) in row.pic_big_pc" :title="key" :key="key" :preview-src-list="Object.values(row.pic_big_pc)" :src="config.image_url+src"></el-image>
          </div>
        </el-table-column>
        <el-table-column prop="logo_color" label="logo_color" width="120">
          <template #default="{row}">
            <el-image :preview-src-list="[row.logo_color]" :src="row.logo_color"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="logo_gray" label="logo_gray" width="300">
          <div class="img-list" slot-scope="{row}">
            <el-image v-for="(src, key) in row.logo_gray" :title="key" :key="key" :preview-src-list="Object.values(row.logo_gray)" :src="config.image_url+src"></el-image>
          </div>
        </el-table-column>
        <el-table-column prop="pic_idle_h5" label="Pic_Idle_H5" width="170">
          <template #default="{row}">
            <el-image :src="config.image_url+row.pic_idle_h5" :preview-src-list="[row.pic_idle_h5]"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="pic_app" label="Pic_app" width="350">
          <template #default="{row}">
            <el-image style="width: 300px;" :src="config.image_url+row.pic_app" :preview-src-list="[row.pic_app]"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="game_name" label="分类项目" />
        <el-table-column prop="status" label="入口开关" fixed="right">
          <template #default="{row}">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ccc"
              @change="(val) => statusChange(val, row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="{row}">
            <i class="el-icon-s-tools" style="font-size:20px;cursor:pointer;" @click="editHandle('edit', row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 游戏编辑/新增 -->
    <el-dialog :title="dialogTitle" append-to-body :visible.sync="showCreateDialog" width="800px" @close="handleClose">
      <el-form label-width="110px" :model="currentData">
        <el-form-item label="游戏名称">
          <el-input v-model="currentData.game_name"  placeholder="游戏名称" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="附标名称">
          <el-input v-model="currentData.sub_title"  placeholder="附标名称" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model.number="currentData.sort" placeholder="排序" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="优惠说明">
          <el-input v-model="currentData.offer_desc" placeholder="优惠说明" maxlength="100"></el-input>
        </el-form-item>
       
        <el-form-item label="Title_logo">
          <div class="upload-tip">建议图片尺寸为450X200，1M 以下</div>
          <el-upload
            class="image-uploader"
            action="/api/global/file"
            :show-file-list="false"
            name="files"
            :on-success="(res, file) => uploadSuccess(res, file, 'title_logo')"
            :headers="uploadHeader">
            <img v-if="currentData.title_logo" :src="currentData.title_logo" class="game-preview">
            <i v-else class="el-icon-plus image-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="Pic_Big_PC">
          <div style="display:flex;justify-content:space-between;pading:10px 0;align-items:center;">
            <div>
              <div class="upload-tip">建议图片尺寸为：200X200，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'pic_big_pc', '200')"
                :headers="uploadHeader">
                <img v-if="currentData.pic_big_pc['200']" :src="currentData.pic_big_pc['200']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon"></i>
              </el-upload>
            </div>
            <div>
              <div class="upload-tip">建议图片尺寸为：550X550，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'pic_big_pc', '550')"
                :headers="uploadHeader">
                <img v-if="currentData.pic_big_pc['550']" :src="currentData.pic_big_pc['550']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon"></i>
              </el-upload>
            </div>
            <div>
              <div class="upload-tip">建议图片尺寸为：600X600，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'pic_big_pc', '600')"
                :headers="uploadHeader">
                <img v-if="currentData.pic_big_pc['600']" :src="currentData.pic_big_pc['600']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon"></i>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="logo_color：">
          <div class="upload-tip">建议图片尺寸为80X80，1M 以下</div>
          <el-upload
            class="image-uploader"
            action="/api/global/file"
            :show-file-list="false"
            name="files"
            :on-success="(res, file) => uploadSuccess(res, file, 'logo_color')"
            :headers="uploadHeader">
            <img v-if="currentData.logo_color" :src="currentData.logo_color" class="game-preview">
            <i v-else class="el-icon-plus image-uploader-icon" style="width:80px;height:80px;"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="logo_gray">
          <div style="display:flex;justify-content:space-between;pading:10px 0;align-items:center;">
            <div>
              <div class="upload-tip">建议图片尺寸为：60X60，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'logo_gray', '60')"
                :headers="uploadHeader">
                <img v-if="currentData.logo_gray['60']" :src="currentData.logo_gray['60']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon" style="width:60px;height:60px;"></i>
              </el-upload>
            </div>
            <div>
              <div class="upload-tip">建议图片尺寸为：70X70，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'logo_gray', '70')"
                :headers="uploadHeader">
                <img v-if="currentData.logo_gray['70']" :src="currentData.logo_gray['70']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon" style="width:70px;height:70px;"></i>
              </el-upload>
            </div>
            <div>
              <div class="upload-tip">建议图片尺寸为：80X80，1M 以下</div>
              <el-upload
                class="image-uploader"
                action="/api/global/file"
                :show-file-list="false"
                name="files"
                :on-success="(res, file) => uploadSuccess(res, file, 'logo_gray', '80')"
                :headers="uploadHeader">
                <img v-if="currentData.logo_gray['80']" :src="currentData.logo_gray['80']" class="game-preview">
                <i v-else class="el-icon-plus image-uploader-icon" style="width:80px;height:80px;"></i>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Pic_Idle_H5：">
          <div class="upload-tip">建议图片尺寸为150X150，1M 以下</div>
          <el-upload
            class="image-uploader"
            action="/api/global/file"
            :show-file-list="false"
            name="files"
            :on-success="(res, file) => uploadSuccess(res, file, 'pic_idle_h5')"
            :headers="uploadHeader">
            <img v-if="currentData.pic_idle_h5" :src="currentData.pic_idle_h5" class="game-preview">
            <i v-else class="el-icon-plus image-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="Pic_app">
          <div class="upload-tip">建议图片尺寸为300X220，1M 以下</div>
          <el-upload
            class="image-uploader"
            action="/api/global/file"
            :show-file-list="false"
            name="files"
            :on-success="(res, file) => uploadSuccess(res, file, 'pic_app')"
            :headers="uploadHeader">
            <img v-if="currentData.pic_app" :src="currentData.pic_app" class="game-preview">
            <i v-else class="el-icon-plus image-uploader-icon" style="width:300px;height:220px;"></i>
          </el-upload>
        </el-form-item>
         <el-form-item label="游戏内文">
          <el-input v-model="currentData.content" type="textarea" :rows="4" placeholder="游戏内文" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api';
import {cloneDeep} from 'lodash'

const defaultData = {
  game_name: '',
  sub_title: '',
  content: '',
  offer_desc: '',
  title_logo: '',
  pic_big_pc: {
    "200": "",
    "550": "",
    "600": ""
  },
  logo_color: "",
  logo_gray: {
    "60": "",
    "70": "",
    "80": ""
  },
  pic_idle_h5: "",
  pic_app: "",
  sort: ''
}

export default {
  name: 'GameSetting',
  data() {
    return {
      gameLoading: false,
      showCreateDialog: false,
      submitLoading: false,
      currentData: defaultData,
      currentGameId: '',
      gameList: [],
      mode: 'add'
    }
  },
  computed: {
    dialogTitle() {
      return {
        edit: '编辑',
        add: '新增'
      }[this.mode]
    },
    config() {
      return this.$store.getters.config;
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
  },
  created() {
    this.fetchGames()
  },
  methods: {
    fetchGames() {
      this.gameLoading = true
      api
        .get('/games/gamemenudetail')
        .then((res) => {
          this.gameList = res.result.list||[]
          this.gameLoading = false
        }).catch(error => {
          this.gameLoading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    statusChange(val, row) {
      console.log(val, row)
      const msg = val ? '开启' : '关闭'
      this.$confirm(`您是否要${msg}入口？`, '温馨提示', {type: 'warning'}).then(() => {
        api
        .put(`/games/gamemenudetail/status/${row.id}`)
        .then(({result}) => {
          this.$message.success('更新成功');
        })
        .catch(error => {
          row.status = val ? 0 : 1
          this.submitLoading = false;
          this.$message.error(error.err_msg);
        });
      }).catch(() => {
        row.status = val ? 0 : 1         
      });
      
    },
    editHandle(mode='add',row) {
      this.mode = mode
      if (row) {
        this.currentGameId = row.id
        const cloneData = cloneDeep(row)
        Object.keys(defaultData).forEach(key => {
            this.currentData[key] = cloneData[key]
        })
      }
      
      this.showCreateDialog = true
    },
    handleClose() {
      this.currentData = defaultData
      this.currentGameId = ''
    },
    uploadSuccess(res, file, key1, key2) {
      console.log(res, file, key1, key2)
      if (key2) {
        this.currentData[key1][key2] = res.result[0]
      } else {
        this.currentData[key1] = res.result[0]
      }
    },
    submit() {
      // if (!this.currentData.status) {
      //   return this.$message.error('请选择状态！');
      // }
      // if (!this.currentData.note) {
      //   return this.$message.error('请填写备注！');
      // }
      let methods = 'post'
      let url = '/games/gamemenudetail'
      if (this.mode==='edit') {
        methods = 'put'
        url = `/games/gamemenudetail/${this.currentGameId}`
      }
      this.submitLoading = true
      this.currentData.sort = Number(this.currentData.sort)
      api[methods](url, this.currentData)
        .then(({result}) => {
          this.submitLoading = false;
          this.$message.success('操作成功');
          this.showCreateDialog = false;
          this.fetchGames()
        })
        .catch(error => {
          this.submitLoading = false;
          this.$message.error(error.err_msg);
        });
    }
  }
}
</script>

<style scoped lang="scss"> 
.content {
  margin: 20px;
  padding: 20px;
  background: #fff;
  .title {
    font-size: 16px;
    padding: 10px 0;
    font-weight: bold;
  }
  .img-list {
    min-width: 200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

<style lang="scss">
.image-uploader {
  font-size: 20px;
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    .game-preview {
      max-width: 200px;
    }
  }
  .el-upload:hover {
    border-color: #409EFF;
  }
  .image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    // line-height: 178px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.upload-tip {
  font-size: 12px;
}
</style>