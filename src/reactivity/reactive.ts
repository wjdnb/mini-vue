import { track, trigger } from "./effect";
import { isObject } from "./shared";

export const enum Flags {
  IS_READONLY = "__v_isReadonly",
  IS_REACTIVE = "__v_isReactive",
}

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);

      if (key === Flags.IS_REACTIVE) {
        return true;
      } else if (key === Flags.IS_READONLY) {
        return false;
      }

      if (isObject(res)) {
        return reactive(res);
      }

      track(target, key);
      return res;
    },

    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return res;
    },
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);

      if (key === Flags.IS_REACTIVE) {
        return false;
      } else if (key === Flags.IS_READONLY) {
        return true;
      }

      if (isObject(res)) {
        return readonly(res);
      }

      return res;
    },
    set(target, key, value, receiver) {
      console.warn("error");
      return true;
    },
  });
}

export function isReadonly(value) {
  return !!value[Flags.IS_READONLY];
}

export function isReactive(value) {
  return !!value[Flags.IS_REACTIVE];
}
