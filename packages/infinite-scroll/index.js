import InfiniteScroll from './src/main.js';

/* istanbul ignore next */
InfiniteScroll.install = function(Vue) {
  Vue.directive(InfiniteScroll.name, InfiniteScroll); // 安装全局指令
};

export default InfiniteScroll;
