import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive, ReactiveFlags } from "./reactive";
import { hasChanged, isObject } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;

  constructor(value) {
    this[ReactiveFlags.IS_REF] = true;
    this._value = convert(value);
    this._rawValue = value;
    this.dep = new Set();
  }

  get value() {
    if (isTracking()) trackEffects(this.dep);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._value)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(raw) {
  return !!raw[ReactiveFlags.IS_REF];
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
