// 跨层级，祖孙组件事件传播

// 向下传播
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    // 获取组件名
    var name = child.$options.componentName;
    // 该组件是事件目的组件
    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    // 向上传播
    dispatch(componentName, eventName, params) {
      var parent = this.$parent || this.$root;
      // 获取父组件名
      var name = parent.$options.componentName;
      // 父组件存在 &&  （  || 父组件不是目的组件） 继续查找
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
