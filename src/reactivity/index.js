let activeEffect;
const weakmap = new Map();

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = weakmap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    weakmap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);

  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  const depsMap = weakmap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  // 新创建一个 set, 避免无限循环问题
  const effectsToRun = new Set(effects);
  //
  effectsToRun.forEach((effectFn) => effectFn());
}

function effect(fn) {
  const effectFn = () => {
    // 每次执行前先把自己移除，这里是为了去除掉已经无效的依赖
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
  };

  effectFn.deps = [];
  effectFn();
}

function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn);
  }
}

let data = {
  ok: true,
  text: "hello world",
};

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    trigger(target, key);
    target[key] = newVal;
  },
});

let haha = {};

effect(() => {
  haha = obj.ok ? obj.text : "not";
});

obj.ok = false;
obj.text = "hahaha";
