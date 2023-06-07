import IvuCascaderMultiSelect from './index.vue'

const install = (Vue) => {
  Vue.component(IvuCascaderMultiSelect.name, IvuCascaderMultiSelect)
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default { install, IvuCascaderMultiSelect }
