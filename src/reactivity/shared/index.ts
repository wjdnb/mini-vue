export const extend = Object.assign;

export function hasChanged(val1, val2) {
  return !Object.is(val1, val2);
}

export function isObject(value) {
  return typeof value === "object" && value !== null;
}
