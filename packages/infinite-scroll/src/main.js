import throttle from 'throttle-debounce/debounce';
import {
  isHtmlElement,
  isFunction,
  isUndefined,
  isDefined
} from 'element-ui/src/utils/types';
import {
  getScrollContainer
} from 'element-ui/src/utils/dom';

const getStyleComputedProperty = (element, property) => { // 获取元素的计算样式
  if (element === window) {
    element = document.documentElement;
  }

  if (element.nodeType !== 1) { // 不是元素节点,即不是标签
    return [];
  }
  // NOTE: 1 DOM access here
  const css = window.getComputedStyle(element, null);
  return property ? css[property] : css; // 传入property则返回property的值，否则返回所有的值
};

const entries = (obj) => {
  return Object.keys(obj || {})
    .map(key => ([key, obj[key]]));
};

const getPositionSize = (el, prop) => {
  return el === window || el === document
    ? document.documentElement[prop]
    : el[prop];
};

const getOffsetHeight = el => {
  return getPositionSize(el, 'offsetHeight');
};

const getClientHeight = el => {
  return getPositionSize(el, 'clientHeight');
};

const scope = 'ElInfiniteScroll';
// infinite-scroll-delay	节流时延，单位为ms	number	-	200
// infinite-scroll-distance	触发加载的距离阈值，单位为px	number	-	0
// infinite-scroll-disabled	是否禁用	boolean	-	false
// infinite-scroll-immediate	是否立即执行加载方法，以防初始状态下内容无法撑满容器。	boolean	-	true
const attributes = {
  delay: {
    type: Number,
    default: 200
  },
  distance: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  immediate: {
    type: Boolean,
    default: true
  }
};

const getScrollOptions = (el, vm) => {
  if (!isHtmlElement(el)) return {};
// attributes = [[delay, 200],...]
  return entries(attributes).reduce((map, [key, option]) => {
    const { type, default: defaultValue } = option;
    let value = el.getAttribute(`infinite-scroll-${key}`);
    value = isUndefined(vm[value]) ? value : vm[value];
    switch (type) {
      case Number:
        value = Number(value);
        value = Number.isNaN(value) ? defaultValue : value;
        break;
      case Boolean:
        value = isDefined(value) ? value === 'false' ? false : Boolean(value) : defaultValue;
        break;
      default:
        value = type(value);
    }
    map[key] = value;
    return map;
  }, {});
};

const getElementTop = el => el.getBoundingClientRect().top;

const handleScroll = function(cb) {
  const { el, vm, container, observer } = this[scope];
  const { distance, disabled } = getScrollOptions(el, vm); // 从使用时传入的参数获取

  if (disabled) return;

  let shouldTrigger = false;

  if (container === el) {
    // be aware of difference between clientHeight & offsetHeight & window.getComputedStyle().height
    const scrollBottom = container.scrollTop + getClientHeight(container);
    shouldTrigger = container.scrollHeight - scrollBottom <= distance;
  } else {
    const heightBelowTop = getOffsetHeight(el) + getElementTop(el) - getElementTop(container);
    const offsetHeight = getOffsetHeight(container);
    const borderBottom = Number.parseFloat(getStyleComputedProperty(container, 'borderBottomWidth'));
    shouldTrigger = heightBelowTop - offsetHeight + borderBottom <= distance;
  }

  if (shouldTrigger && isFunction(cb)) {
    cb.call(vm);
  } else if (observer) {
    observer.disconnect();
    this[scope].observer = null;
  }

};

export default {
  name: 'InfiniteScroll',
  inserted(el, binding, vnode) {
    const cb = binding.value; // v-infinite-scroll='fn'

    const vm = vnode.context;
    // only include vertical scroll 只包含垂直滚动
    const container = getScrollContainer(el, true);
    const { delay, immediate } = getScrollOptions(el, vm);
    const onScroll = throttle(delay, handleScroll.bind(el, cb));

    el[scope] = { el, vm, container, onScroll };

    if (container) {
      container.addEventListener('scroll', onScroll);

      if (immediate) {
        const observer = el[scope].observer = new MutationObserver(onScroll);
        observer.observe(container, { childList: true, subtree: true });
        onScroll();
      }
    }
  },
  unbind(el) {
    const { container, onScroll } = el[scope];
    if (container) {
      container.removeEventListener('scroll', onScroll);
    }
  }
};

