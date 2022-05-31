import { createApp } from "vue"
import SvgIcon from "@/components/SvgIcon/index.vue" // svg component
/**
 * require.context ,webpack提供的api
 * directory {String} -读取文件的路径
  useSubdirectories {Boolean} -是否遍历文件的子目录
  regExp {RegExp} -匹配文件的正则
 * 返回一个require函数，作用跟import一样,这个函数有3个属性：
  resolve {Function}: 接受一个参数request，request为test文件夹下面匹配文件的相对路径，返回这个匹配文件相对于整个工程的相对路径
keys {Function}: 返回匹配成功模块的名字组成的数组
id {String}: 执行环境的id
 */
const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)

export default (app: ReturnType<typeof createApp>) => {
  app.component("SvgIcon", SvgIcon)
}
