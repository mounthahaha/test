<template>
  <div class="login-container">
    <vue-particles class="particles" color="#fff" :particle-opacity="0.2" :particles-number="50" />
    <div class="login-card">
      <div class="title">
        <span>LOGIN</span>
      </div>
      <div class="content">
        <el-form ref="loginFormDom" :model="loginForm" :rules="loginRules" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" autocomplete="off"
              :placeholder="t('g_text_field_placeholder_username')" type="text" tabindex="1" :prefix-icon="User"
              size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" :placeholder="t('player_add_form_password')" type="password"
              tabindex="2" :prefix-icon="Lock" size="large" />
          </el-form-item>
          <el-form-item prop="locale" class="my-el-form-item">
            <el-icon class="location-icon">
              <AddLocation />
            </el-icon>
            <el-select v-model="i18nStore.locale" size="large" @change="i18nStore.toggleLocale">
              <el-option v-for="item in i18nStore.langItem" :key="item.key" :label="item.value"
                :value="item.langCode" />
            </el-select>
          </el-form-item>
          <el-button :loading="loading" size="large" round @click.prevent="handleLogin"> 登 录 </el-button>
        </el-form>
      </div>
    </div>
    <SvgIcon name="login-scheme-right" class="login-scheme-right"></SvgIcon>
    <div class="copyright">
      Copyright © 测试{{ new Date().getFullYear() }}
      <strong>API v{{ appStore.apiVersion.version }}, </strong><strong>{{ appStore.apiVersion.time }} </strong> Allrights reserved.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '@/store/modules/i18n'
import { User, Lock, AddLocation } from "@element-plus/icons-vue"
import { useAppStore } from "@/store/modules/app"

const i18nStore = useI18nStore()
const { t } = useI18n()

const appStore = useAppStore()

interface ILoginForm {
  /** admin 或 editor */
  username: string
  /** 密码 */
  password: string
  /** 随机数 */
  codeToken: string
}

appStore.getApiVersion()

const router = useRouter()
const loading = ref<boolean>(false)
const loginFormDom = ref<any>()
const realCode = ref<string>("")



const loginForm = reactive<ILoginForm>({
  username: "",
  password: "",
  codeToken: ""
})

const validatecode = (rule: any, value: any, callback: any) => {
  //符合条件后必须调用callbacl() 
  if (value.toLowerCase() !== realCode.value.toLowerCase()) {
    callback(new Error('Please input the code again'))
  } else {
    callback()
  }
}
const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 18, message: "长度在 6 到 18 个字符", trigger: "blur" }
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" },
  { validator: validatecode, message: "请输入正确验证码", trigger: "blur" }
  ]
}
const handleLogin = () => {
  loginFormDom.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login({
          username: loginForm.username,
          password: loginForm.password
        })
        .then(() => {
          loading.value = false
          router.push({ path: "/" })
        })
        .catch(() => {
          loading.value = false
        })
    } else {
      return false
    }
  })
}


</script>


<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  background-color: #000;

  .particles {
    position: absolute;
    width: 99%;
    height: 99%;
  }

  .login-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 450px;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: transparent;
    overflow: hidden;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0;
      color: #fff;
      font-size: 25px;
      font-weight: 700;
    }

    .content {
      padding: 20px 50px 50px 50px;

      .el-form-item {
        margin-bottom: 60px;
      }

      .el-input {
        font-size: 18px;
      }

      .el-select {
        width: 100%;
      }

      .my-el-form-item {
        position: relative;

        .location-icon {
          position: absolute;
          font-size: 22px;
          color: #fff;
          top: 8px;
          left: 12px;
        }

        :deep(.el-input__wrapper) {
          padding-left: 40px;
          font-size: 16px;
        }
      }

      .el-button {
        width: 100%;
        margin-top: 10px;

        &:hover {
          color: inherit;
        }
      }
    }
  }

  .login-scheme-right {
    position: absolute;
    bottom: 0;
    right: 0;
    opacity: 1;
    font-size: 300px;
    transform: rotateY(180deg);
  }
  .copyright {
    width: 100%;
    text-align: center;
    position: absolute;
    left: 0;
    bottom: 20px;
    color: #ffffff;
  }
  :deep(.el-input__wrapper) {
    --el-input-text-color: #fff;
    --el-input-icon-color: #fff;
    background-color: transparent;

    // 修复chrome自动填充input背景
    input:-internal-autofill-selected {
      -webkit-transition: background-color 50000s ease-in-out 0s;
      transition: background-color 50000s ease-in-out 0s;
      -webkit-text-fill-color: #fff !important;
    }
  }
}
</style>
