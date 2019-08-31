<template>
  <section class="el-container" :class="{ 'is-vertical': isVertical }">
    <slot></slot>
  </section>
</template>

<script>
  export default {
    name: 'ElContainer',

    componentName: 'ElContainer',

    props: {
      direction: String  // vertical、horizontal
    },

    computed: {
      isVertical() { // 为什么是计算属性？
        if (this.direction === 'vertical') {
          return true;
        } else if (this.direction === 'horizontal') {
          return false;
        }
        // 如果有el-header 或者el-footer 将默认垂直布局
        return this.$slots && this.$slots.default
          ? this.$slots.default.some(vnode => {
            const tag = vnode.componentOptions && vnode.componentOptions.tag;
            return tag === 'el-header' || tag === 'el-footer';
          })
          : false;
      }
    }
  };
</script>
