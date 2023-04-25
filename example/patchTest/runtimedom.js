export function createElement(tag) {
  return document.createElement(tag);
}

export function setElementText(el, text) {
  el.textContent = text;
}

export function insert(el, parent, anchor = null) {
  parent.insertBefore(el, anchor);
}

export function patchProps(el, key, prevValue, nextValue) {
  if (/^on/.test(key)) {
    // 事件处理函数应该同时支持多个
    let invokers = el._vei || (el._vei = {});
    let invoker = invokers[key];
    const name = key.slice(2).toLowerCase();
    if (nextValue) {
      if (!invoker) {
        invoker = el._vei[key] = (e) => {
          if (e.timeStamp < invoker.attached) return;
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach((fn) => fn(e));
          } else {
            invoker.value(e);
          }
        };
        invoker.value = nextValue;
        invoker.attached = performance.now();
        el.addEventListener(name, invoker);
      } else {
        invoker.value = nextValue;
      }
    } else if (invoker) {
      el.removeEventListener(name, invoker);
    }
  } else if (key === "class") {
    el.className = nextValue || "";
  } else if (shouldSetAsProps(el, key, nextValue)) {
    const type = typeof el[key];
    const value = nextValue;
    // 矫正布尔值的问题
    if (type === "boolean" && value === "") {
      el[key] = true;
    } else {
      el[key] = nextValue;
    }
  } else {
    el.setAttribute(key, nextValue);
  }
}

function shouldSetAsProps(el, key, nextValue) {
  if (key === "form" && el.tagName === "INPUT") return false;

  return key in el;
}

export function unmount(vnode) {
  const el = vnode._vnode.el;
  const parent = el.parentNode;
  if (parent) parent.removeChild(el);
}
