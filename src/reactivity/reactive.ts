import { track, trigger } from "./effect";

// 1. 每次访问的时候把访问的依赖收集起来
// 2. 赋值的时候执行所有依赖

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
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
