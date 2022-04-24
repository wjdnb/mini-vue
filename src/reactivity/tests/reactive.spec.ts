import { isProxy, isReactive, reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { asd: 1 } };
    const observed = reactive(original);
    // 这里返回的是一个 proxy
    expect(observed).not.toBe(original);

    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);

    expect(isProxy(observed)).toBe(true);
  });

  it("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
