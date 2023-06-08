import IvuCascaderMultiSelect from './index.vue'

IvuCascaderMultiSelect.install = (Vue) => {
  Vue.component(IvuCascaderMultiSelect.name, IvuCascaderMultiSelect)
}
if (typeof window !== 'undefined' && window.Vue) {
  IvuCascaderMultiSelect.install(window.Vue)
}

export default IvuCascaderMultiSelect
