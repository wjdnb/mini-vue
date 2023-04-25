import { effect, ref } from "../../lib/guide-mini-vue.esm.js";

const options = {
  createElement(type) {
    return document.createElement(type);
  },
  appendChild(el, container) {
    container.appendChild(el);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  patchProps(el, key, value) {
    el.setAttribute(key, value);
  },
};

// 渲染器不一定和 dom 有关
function createRenderer(options) {
  const { createElement, appendChild, setElementText, patchProps } = options;

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
    }
  }

  // 只更新需要的部分, 为此需要把以前的记录下来
  function patch(n1, n2, container) {
    // 新增
    if (!n1) {
      const { type } = n2;
      // TODO 这儿没考虑到更新的情况
      if (typeof type === "string") {
        const el = createElement(vnode.type);

        if (vnode.props) {
          for (const key in vnode.props) {
            patchProps(el, key, vnode.props[key]);
          }
        }

        if (typeof vnode.children === "string") {
          setElementText(el, vnode.children);
        } else if (Array.isArray(vnode.children)) {
          vnode.children.forEach((node) => render(node, el));
        }

        appendChild(el, container);
      }
    }
  }

  return { render };
}

// const vnode = {
//   type: "h1",
//   children: "hello",
// };

const bol = ref(true);
const count = ref("asd");

const vnode = {
  type: "div",
  props: bol.value
    ? {
        id: "foo",
      }
    : {},
  children: [
    {
      type: "p",
      children: count.value,
    },
  ],
};

const renderer = createRenderer(options);

effect(() => {
  renderer.render(vnode, document.querySelector("#app"));
});

count.value++;
