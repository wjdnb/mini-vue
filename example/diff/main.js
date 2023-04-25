// 现在要写一个渲染器
// 作用是把 vdom，转换成真实dom
import { effect, ref } from "../../lib/guide-mini-vue.esm.js";
import {
  setElementText,
  createElement,
  insert,
  patchProps,
  unmount,
} from "./runtimedom.js";

// 为了创造通用渲染器，把跟 dom 相关的全部提取出来
function createRenderer(options) {
  const { setElementText, createElement, insert, patchProps, unmount } =
    options;

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }

    container._vnode = vnode;
  }

  function patch(n1, n2, container, anchor) {
    console.log("n1", n1);
    console.log("n2", n2);
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null;
    }

    const { type } = n2;
    if (typeof type === "string") {
      // first time
      if (!n1) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2, container);
      }
    } else if (typeof type === "object") {
      // component
    }
  }

  function patchElement(n1, n2, container) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;

    // 新增
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }

    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }

    patchChildren(n1, n2, el);
  }

  function patchChildren(n1, n2, container) {
    // 新节点是 string
    if (typeof n2.children === "string") {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c));
      }
      setElementText(container, n2.children);
      // 新节点是 array
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // diff
        patchKeyedChildren(n1, n2, container);
      } else {
        // 这个节点不能被清除因为还有子节点
        setElementText(container, "");
        n2.children.forEach((c) => patch(null, c, container));
      }
      // 没有新节点
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c));
      } else if (typeof n1.children === "string") {
        setElementText(container, "");
      }
    }
  }

  function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    let oldStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newChildren.length - 1;

    let oldStartVNode = oldChildren[oldStartIdx];
    let oldEndVNode = oldChildren[oldEndIdx];
    let newStartVNode = newChildren[newStartIdx];
    let newEndVNode = newChildren[newEndIdx];

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVNode.key === newStartVNode.key) {
        patch(oldStartVNode, newStartVNode, container);
        oldStartVNode = oldChildren[++oldStartIdx];
        newStartVNode = newChildren[++newStartIdx];
      } else if (oldEndVNode.key === newEndVNode.key) {
        patch(oldEndVNode, newEndVNode, container);
        oldEndVNode = oldChildren[--oldEndIdx];
        newStartVNode = newChildren[--newEndIdx];
      } else if (oldStartVNode.key === newEndVNode.key) {
        patch(oldStartVNode, newEndVNode);
        insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
        oldStartVNode = oldChildren[++oldStartIdx];
        newEndVNode = newChildren[--newEndIdx];
      } else if (oldEndVNode.key === newStartVNode.key) {
        patch(oldEndVNode, newStartVNode, container);
        insert(oldEndVNode.el, container, oldStartVNode.el);

        oldEndVNode = oldChildren[--oldEndIdx];
        newStartVNode = newChildren[++newStartIdx];
      } else {
        // 如果都没命中的情况
        const idxInOld = oldChildren.findIndex(
          (node) => node.key === newStartVNode.key
        );

        if (idxInOld > 0) {
          const vnodeToMove = oldChildren[idxInOld];
          patch(vnodeToMove, newStartVNode, container);
          insert(vnodeToMove.el, container, oldStartVNode.el);
          oldChildren[idxInOld] = undefined;
        } else {
          // 新增
          patch(null, newStartVNode, container, oldStartVNode.el);
        }
        newStartVNode = newChildren[++newStartIdx];
      }
    }
    // 有新增节点没处理
    if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        patch(null, newChildren[i], container, oldStartVNode.el);
      }
    } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        unmount(oldChildren[i]);
      }
    }
  }

  function mountElement(vnode, container, anchor) {
    // 这里是为了让 vnode 关联真实的 dom，然后使用原生方法将 dom 移除
    const el = (vnode.el = createElement(vnode.type));

    // 结合 attribute 和 property 设置
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }

    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => patch(null, child, el));
    }
    insert(el, container, anchor);
  }

  return { render };
}

// const vnode = {
//   type: "h1",
//   children: "hello",
// };
// const vnode = {
//   type: "div",
//   props: {
//     id: "foo",
//   },
//   children: [
//     {
//       type: "p",
//       children: "hello",
//     },
//   ],
// };

const renderer = createRenderer({
  insert,
  createElement,
  setElementText,
  patchProps,
  unmount,
});

const bol = ref(false);
const app = document.querySelector("#app");

effect(() => {
  const vnode = {
    type: "div",
    props: bol.value
      ? {
          onClick: () => {
            console.log("father clicked");
          },
        }
      : {},
    children: [
      {
        type: "p",
        props: {
          onClick: () => {
            bol.value = true;
          },
        },
        children: "text",
      },
    ],
  };

  renderer.render(vnode, app);
});

let el = document.createElement("h1");
el.textContent = "haha";
el._vode = "here";
document.body.appendChild(el);
console.log(el);