<template>
  <div class="multi-cascader">
    <Dropdown :trigger="'click'"
              :placement="placement"
              :transfer="transfer"
              :stop-propagation="true"
              :transfer-class-name="`${popperClass} ${unid}`"
              @on-visible-change="visibleChange"
              v-bind="$attrs">
      <div class="labels"
           @mouseenter="handleMouseenter"
           @mouseleave="handleMouseleave">
        <div v-if="selectedLabels.length > 0"
             class="tags">
          <Tag v-for="tag in selectedLabels"
               :fade="false"
               :key="getKey(tag)"
               closable
               @on-close="removeOne(tag)">
            <span class="text"
                  :title="tag">{{tag}}</span>
          </Tag>
        </div>
        <p v-else
           class="placeholder-text">{{placeholder}}</p>
        <!-- 清空 -->
        <Icon v-show="showClearBtn"
              class="r-icon"
              @click.stop.prevent="handleClear"
              type="ios-close-circle-outline"></Icon>
        <!-- 下拉icon -->
        <Icon v-show="!showClear"
              class="r-icon exp"
              type="ios-arrow-down"></Icon>
      </div>
      <div slot="list"
           class="dropdown-items">
        <div class="ground"
             @click.stop>
          <div class="ground-item">
            <render-list :list="root.childNodes"
                         :level="1"
                         :active-list="activeList"
                         :notUseAble="notUseAble"
                         :maxRequest="maxRequest"
                         :useMax="useMax"
                         @handle-click="handleClick"
                         @handle-check="handleCheck"
                         @handle-checkAll="handleCheckAll"
                         :label-key="labelKey"
                         :expand-trigger="expandTrigger"
                         :showCheckAll="showCheckAll"></render-list>
          </div>
          <template v-for="item in maxLevellist">
            <div v-if="item.rendered && showData[item.id].length"
                 v-show="activeList.length >= item.id"
                 :key="getKey(item)"
                 class="ground-item ground-pos">
              <render-list :list="showData[item.id]"
                           :level="item.id + 1"
                           :active-list="activeList"
                           :notUseAble="notUseAble"
                           :maxRequest="maxRequest"
                           :useMax="useMax"
                           @handle-click="handleClick"
                           @handle-check="handleCheck"
                           @handle-checkAll="handleCheckAll"
                           :label-key="labelKey"
                           :expand-trigger="expandTrigger"
                           :showCheckAll="showCheckAll"></render-list>
            </div>
          </template>
        </div>
      </div>
    </Dropdown>
  </div>
</template>

<script>
import TreeStore from './lib/Tree.js'
import renderList from './render-list.vue'
import _ from 'lodash'
export default {
  name: 'ivu-cascader-multi-select',
  components: {
    renderList
  },
  props: {
    // 是否要回显labels
    echoLabel: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 每一级别是否可以选择的数据字段，不填写默认显示选择框。tips: 只有在当前层级全部设置为true才会显示复选框和全选框
    checkKey: {
      type: String,
      default: 'showCheck'
    },
    // @todo 设置上级的全选不用选择下一级的数据
    // false 不用选择下一级 true 必选选择下一级
    notSelectNext: {
      type: Boolean,
      default: false
    },
    // 最大的请求层级 0 为不限制
    maxRequest: {
      type: Number,
      default: 0
    },
    // 异步加载子元素 异步传入数据
    sync: {
      type: Boolean,
      default: false
    },
    // 异步请求数据的回调 必须开启异步请求开关 sync为true
    syncCallBack: {
      type: Function,
      default: () => {
        // 默认一个函数
        return () => {}
      }
    },
    // label显示的层级 all 全部 / last 最后一层
    labelLv: {
      type: String,
      default: 'all'
    },
    // 下拉菜单出现的位置，可选值为toptop-starttop-endbottombottom-startbottom-endleftleft-startleft-endrightright-startright-en
    placement: {
      type: String,
      default: 'bottom'
    },
    // 是否放在body下面展示list
    transfer: {
      type: Boolean,
      default: false
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 最大选择数 使用该属性不能使用全选功能
    maxCount: {
      type: Number
    },
    // 标签是否可以全部清空
    clearable: {
      type: Boolean,
      default: false
    },
    // 列表数据
    data: {
      type: Array,
      default: () => [],
      required: true
    },
    // 是否只显示选中的
    onlyShowChecked: {
      type: Boolean,
      default: false
    },
    isShowIndeterminate: {
      // 是否显示半选
      type: Boolean,
      default: true
    },
    // v-model值，页面刷新默认值（只需传选中的id，eg：['jiaohu', 'yizhi']）注意不要传重复，传了父节点就不要传子节点（错误案例：['zhinan', 'yizhi']）
    value: {
      type: Array,
      required: true
    },
    // 分隔符（onlyShowChecked为false时有效）
    separator: {
      type: String,
      default: '-'
    },
    // ------暂不支持搜索---------------
    // 是否可搜索
    filterable: {
      type: Boolean,
      default: false
    },
    // 自定义搜索方法
    filterMethod: {
      type: Function
    },
    // Select 下拉框的类名
    popperClass: {
      type: String,
      default: 'ivu-multi-cascader'
    },
    // 作为 value 唯一标识的键名，绑定值为对象类型时必填
    valueKey: {
      type: String,
      default: 'value'
    },
    // 作为 label 唯一标识的键名，绑定值为对象类型时必填
    labelKey: {
      type: String,
      default: 'label'
    },
    // 作为 children 唯一标识的键名，绑定值为对象类型时必填
    childrenKey: {
      type: String,
      default: 'children'
    },
    // 下级展开方式
    expandTrigger: {
      type: String,
      default: 'click'
    },
    // 是否允许父子联动
    selectChildren: {
      type: Boolean,
      default: true
    },
    showCheckAll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 显示清空
      showClear: false,
      // 缓存传入的label和value
      storeEchoData: {
        label: [],
        value: []
      },
      // 唯一类 面板
      unid: 'uid-' + this.getKey(),
      activeClass: '',
      // 选择的label
      selectedLabels: [],
      // 选择的id
      selectedIds: [],
      // 选择的节点
      selectedNodes: [],
      // 数据存储容器
      store: {},
      // 根节点组
      root: [],
      // 最高层级的数据 @data id:1 rendered:true
      maxLevellist: [],
      // 节点后面的组
      showData: {},
      activeList: [],
      // 搜索
      searchText: '',
      searchResult: []
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    // 显示清空按钮
    showClearBtn() {
      return this.clearable && this.value.length > 0 && this.showClear
    },
    // 有没有传入回显
    renShow() {
      return this.sync && this.echoLabel.length > 0
    },
    // 面板宽度
    activeClassByWidth() {
      if (!this.activeClass) return 160
      return 160 * +this.activeClass
    },
    // 是不是在搜素
    isSearching() {
      return !(this.searchText.trim() === '')
    },
    // 超出最大选择个数 不可用
    notUseAble() {
      return this.maxCount ? this.selectedIds.length >= this.maxCount : false
    },
    // 用了最大限制
    useMax() {
      return Boolean(this.maxCount)
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.init()
      }
    },
    selectedNodes() {
      const selected = this.selectedNodes.map(o => o[this.valueKey])
      this.$emit('change', selected)
    },
    // 传入数据变化更新store选中数据
    value: {
      deep: true,
      handler(n, o) {
        const JS = JSON.stringify
        if (!n || !o || JS(n) === JS(o)) return
        // 不可用时不更新数据
        if (this.notUseAble) {
          this.$emit('input', n.slice(0, this.maxCount))
        }
        // 清空选择
        this.cleatStoreSeleted()
        if (this.value.length <= 0) {
          this.showClear = false
          return
        }
        // 先清空 在选中
        this.renderData()
      }
    },
    // 返回labels
    selectedLabels: {
      deep: true,
      handler(n, o) {
        this.$emit('getLables', n)
      }
    }
  },
  methods: {
    handleMouseenter() {
      if (this.clearable && this.value.length > 0) {
        this.showClear = true
      }
    },
    handleMouseleave() {
      if (this.clearable && this.value.length > 0) {
        this.showClear = false
      }
    },
    // 弹出层的展示和取消
    visibleChange(v) {
      if (!v) {
        this.searchText = ''
      }
      this.$emit('visible-change', v)
    },
    // 清空内部数据存储
    cleatStoreSeleted() {
      this.store.nodeList.forEach(targetNode => {
        if (targetNode) {
          targetNode.check(false)
        }
      })
      this.selectedNodes = []
      this.selectedLabels = []
      this.selectedIds = []
    },
    // 全部清空
    handleClear() {
      this.$emit('input', [])
      this.cleatStoreSeleted()
      this.$emit('clear')
    },
    // 搜索
    innerFilterMethod(v) {
      this.searchText = v
      let tempResult = this.store.nodeList
      if (v.trim() !== '') {
        this.activeClass = ''
        if (typeof this.filterMethod === 'function') {
          this.searchResult = this.filterMethod(tempResult, v)
        } else {
          tempResult = tempResult.filter(o => o.isLeaf)
          tempResult = tempResult.filter(o => o.showLabel.includes(v))
          this.searchResult = tempResult
        }
      } else {
        this.activeClass = '1'
      }
    },
    // 唯一key v-for
    getKey() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0
        let v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    // 面板一层点击
    handleClick(node, levelIndex, level) {
      const { sync, syncCallBack, maxRequest } = this
      const { childNodes = [], loading = false, showExpIcon = true } = node
      if (childNodes && childNodes.length <= 0) {
        // 是异步请求模式 有请求回调方法 不是正在请求中 有下一级数据要显示
        const canSync = sync && syncCallBack && !loading && showExpIcon
        // 有设置最大请求层级 没有超过最大请求层级数
        const canMax = maxRequest ? level < maxRequest : true
        // 最大层级了不能再点击了
        if (!canMax) {
          node.nodeSyncSetData({ showExpIcon: false })
        }
        if (canSync && canMax) {
          // loading状态
          node.nodeSyncSetData({ loading: true })
          this.syncCallBack(node)
            .then(children => {
              if (children && children.length > 0) {
                node.nodeSyncClick(children)
                children.forEach(child => {
                  node.insertChild(child)
                })

                this.maxLevellist = Array.from(
                  { length: this.store.maxLevel - 1 },
                  (v, i) => {
                    return {
                      id: i + 1,
                      rendered: true
                    }
                  }
                )
                node.nodeSyncSetData({ loading: false })
                this.showNext(node, levelIndex, level)
                // 有了数据更新前后状态
                this.$nextTick(() => {
                  node.checked = false
                  this.handleCheck(node)
                  // 存一下需要删除值的索引
                  let indexArr = []
                  setTimeout(() => {
                    let { value: echoVal, label: echoName } = this.storeEchoData
                    node.childNodes &&
                      node.childNodes.forEach(childNode => {
                        // 当前子节点的value
                        let nodeVal = this.getValueByNode(childNode)
                        // 子节点在回显缓存中的索引
                        let nodeIndex = _.findIndex(echoVal, v => v === nodeVal)
                        // 缓存中存在该节点的值
                        if (nodeIndex !== -1) {
                          childNode.check(true)
                          // 选择完会加上该节点的id
                          // 思路：选择的节点中有回显的值，将该节点的id替换回显中的id
                          this.store.selectedIds.pop()
                          // 存索引 用于当前列的值替换完了后，更新缓存的值，已经的替换的就删除缓存的值
                          indexArr.push(nodeIndex)
                          // 替换
                          this.store.selectedIds.splice(
                            nodeIndex,
                            1,
                            childNode.id
                          )
                        }
                      })

                    // 更新缓存的值
                    indexArr.forEach(i => {
                      echoVal.splice(i, 1, 'USED')
                      echoName.splice(i, 1, 'USED')
                    })
                    this.storeEchoData = {
                      value: echoVal.filter(v => v !== 'USED'),
                      label: echoName.filter(v => v !== 'USED')
                    }
                    this.updateSelect(this.store.selectedIds)
                  }, 16.7)
                })
              } else {
                node.nodeSyncSetData({ loading: false, showExpIcon: false })
              }
            })
            .catch(() => {
              node.nodeSyncSetData({ loading: false })
              this.showNext(node, levelIndex, level)
            })
        }
      } else {
        this.showNext(node, levelIndex, level)
      }
    },
    // 显示下级
    showNext(node, levelIndex, level) {
      if (this.maxLevellist[level - 1]) {
        this.maxLevellist[level - 1].rendered = true
      }
      this.activeClass = `${node.isLeaf ? level : level + 1}`
      let tempList = _.cloneDeep(this.activeList)
      if (level < tempList.length) {
        tempList.splice(level)
      }
      tempList[level - 1] = node.id
      this.showData[level] = node.childNodes
      this.activeList = tempList
    },
    // 半选状态
    isIndeterminate(level, nodeList) {
      if (level === 0) return
      nodeList.forEach(node => {
        let checkedlList = node.childNodes.filter(child => child.checked)
        if (node.level - level === -1) {
          node.indeterminate = false
          let indeterminatelist = node.childNodes.filter(
            child => child.indeterminate
          )
          let sumLength = checkedlList.length + indeterminatelist.length
          if (sumLength && checkedlList.length < node.childNodes.length) {
            node.indeterminate = true
            this.isIndeterminate(level - 1, this.root.childNodes)
          }
        } else if (node.level !== level) {
          this.isIndeterminate(level, node.childNodes)
        }
        if (checkedlList.length === node.childNodes.length) {
          node.indeterminate = false
        }
      })
    },
    // 获取单个节点的value
    getValueByNode(node) {
      let val = node[this.valueKey] || ''
      while (node.parent[this.valueKey]) {
        let pval = node.parent[this.valueKey]
        val = pval + this.separator + val
        node = node.parent
      }
      return val
    },
    // 获取value
    getValue() {
      let result = this.selectedNodes.map(o => {
        if (!this.onlyShowChecked) {
          let level = o.level
          let valueKey = ''
          let node = _.cloneDeep(o)
          while (level !== 0) {
            valueKey =
              node[this.valueKey] + (valueKey ? this.separator : '') + valueKey
            node = node.parent
            level--
          }
          return valueKey
        }
        return o[this.valueKey]
      })
      // 有不存在的id 小于0的
      let hasEmptyIndex = _.findIndex(this.selectedIds, v => +v < 0)
      if (hasEmptyIndex !== -1) {
        result = [...this.storeEchoData.value, ...result]
      }
      return result
    },
    // 面板复选框选中
    handleCheck(node) {
      node.check(node.checked)
      this.selectedIds = this.store.selectedIds
      this.updateSelect(this.store.selectedIds)
      const result = this.getValue()
      this.$emit('input', result)
      this.$nextTick(() => {
        if (this.isShowIndeterminate && this.selectChildren) {
          this.isIndeterminate(node.level, this.root.childNodes)
        }
      })
    },
    // 面板复选框全选中
    handleCheckAll(val, list) {
      list.forEach(node => node.check(val))
      this.selectedIds = this.store.selectedIds
      this.updateSelect(this.store.selectedIds)
      const result = this.getValue()
      this.$emit('input', result)
    },
    // 标签单个删除
    removeOne(label) {
      // 删除传入的数据
      let { label: echoName, value: echoVal } = this.storeEchoData
      if (echoName.includes(label)) {
        let index = _.findIndex(echoName, name => name === label)
        echoName.splice(index, 1)
        echoVal.splice(index, 1)
        this.store.selectedIds.splice(index, 1)
        this.updateSelect(this.store.selectedIds)
        const result = this.getValue()
        this.$emit('input', result)
        this.$emit('remove-tag', label)
        return
      }
      let targetNode = _.find(this.selectedNodes, { showLabel: label })
      if (!this.onlyShowChecked) {
        let str = label.substring(label.lastIndexOf(this.separator) + 1)
        targetNode = _.find(this.selectedNodes, { showLabel: str })
      }
      targetNode.checked = false
      this.handleCheck(targetNode)
      this.$emit('remove-tag', label)
    },
    // 选中数据更新转态
    updateSelect(data, needCheckNode = false, setValue = false) {
      let tempSelectedNodes = []

      // 不存在的id 设置为小于0
      let newId = 0
      const { value: echoVal, label: echoName } = this.storeEchoData
      const ids = echoVal.map(v => --newId)

      let tempSelectedLabels =
        echoName.length === 0 ? [] : _.cloneDeep(echoName)
      let tempSelectedIds = ids.length === 0 ? [] : ids

      data.forEach(o => {
        let targetNode
        if (setValue) {
          targetNode = _.find(this.store.nodeList, v => `${v.id}` === `${o}`)
          // tempSelectedIds.push(targetNode.id);
          targetNode && !tempSelectedIds.includes(o) && tempSelectedIds.push(o)
        } else {
          targetNode = this.store.nodesMap[o]
          targetNode && !tempSelectedIds.includes(o) && tempSelectedIds.push(o)
        }
        if (targetNode) {
          needCheckNode && targetNode.check(true)
          let label = ''
          if (!this.onlyShowChecked) {
            let level = targetNode.level
            let node = _.cloneDeep(targetNode)
            while (level !== 0) {
              label = node.showLabel + (label ? this.separator : '') + label
              node = node.parent
              level--
            }
          } else {
            label = targetNode.showLabel
          }
          // 显示最后一层
          if (this.labelLv === 'last') {
            const labelArr = label.split(this.separator)
            label = labelArr[labelArr.length - 1]
          }
          tempSelectedNodes.push(targetNode)
          tempSelectedLabels.push(label)
        }
      })
      this.selectedNodes = tempSelectedNodes
      this.selectedLabels = tempSelectedLabels
      this.selectedIds = tempSelectedIds
    },
    // 初始化
    init() {
      if (this.renShow) {
        this.storeEchoData = {
          value: _.cloneDeep(this.value),
          label: _.cloneDeep(this.echoLabel)
        }
      }
      this.store = new TreeStore({
        data: this.data,
        isShowIndeterminate: this.isShowIndeterminate,
        selectChildren: this.selectChildren,
        separator: this.separator,
        valueKey: this.valueKey,
        labelKey: this.labelKey,
        childrenKey: this.childrenKey,
        checkKey: this.checkKey,
        labelLv: this.labelLv
      })
      this.root = this.store.root
      this.maxLevellist = Array.from(
        { length: this.store.maxLevel - 1 },
        (v, i) => {
          this.showData[i + 1] = []
          return {
            id: i + 1,
            rendered: false
          }
        }
      )
      // 根据this.value找到id组
      this.renderData()
    },
    // 回显
    renderData() {
      // 数据没有
      if (this.value.length <= 0) return
      // 根据this.value找到id组
      let newId = 0
      let tempSelectedIds = this.value.map(value => {
        const { valueKey, nodeList, separator } = this.store
        const vs = value.split(separator)
        const last = vs[vs.length - 1]
        const targetNode = _.find(
          nodeList,
          item => `${item[valueKey]}` === `${last}`
        )
        return targetNode ? targetNode.id : --newId
      })
      this.updateSelect(tempSelectedIds, true, true)
      this.store.selectedIds = this.selectedIds
    }
  }
}
</script>
<style lang="less" scoped>
.multi-cascader {
  position: relative;
  /deep/ .ivu-dropdown {
    width: 100%;
  }
  /deep/ .ivu-select-dropdown {
    max-height: none !important;
    left: 0 !important;
    width: fit-content;
  }
  /deep/ .ivu-tag {
    display: flex;
    align-items: center;
    .ivu-tag-text {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
    }
  }
}
// 显示点击
.labels {
  position: relative;
  overflow-y: auto;
  max-height: 80px;
  min-height: 32px;
  border-radius: 3px;
  border: 1px solid #dddddd;
  width: 100%;
  height: auto;
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;

  /* 设置滚动条的样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  /* 滚动槽 */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
  }
  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.05);
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
  }

  .placeholder-text {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    color: #b8b9bb;
    padding-left: 7px;
    padding-right: 33px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
  .tags {
    padding-left: 5px;
    padding-right: 18px;
    height: auto;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    .text {
      cursor: default;
    }
  }
  .r-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    /deep/ .ivu-icon {
      font-size: 15px;
    }
  }
}
// 面板
.ground {
  display: flex;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  .ground-pos {
    border-left: 1px solid #eee;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
<style lang="less">
.ivu-multi-cascader {
  max-height: 250px !important;
}
</style>
