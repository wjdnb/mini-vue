let activeEffect;
const targetMap = new WeakMap();

// 收集依赖
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (!activeEffect) return;

  dep.add(activeEffect);
  if (!activeEffect.deps) activeEffect.deps = new Set();
  activeEffect.deps.add(dep);
}

// 执行所有依赖
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  dep.forEach((fn) => {
    if (fn.scheduler) {
      fn.scheduler();
    } else {
      fn();
    }
  });
}

export function effect(fn, options: any = {}) {
  activeEffect = fn;
  if (options.scheduler) {
    activeEffect.scheduler = options.scheduler;
  } else if (options.onStop) {
    activeEffect.onStop = options.onStop;
  }
  fn();
  return fn;
}

export function stop(fn) {
  fn.deps.forEach((dep) => {
    dep.delete(fn);
  });

  fn.onStop();
}
