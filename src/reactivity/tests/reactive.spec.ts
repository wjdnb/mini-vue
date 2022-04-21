import { reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    // 这里返回的是一个 proxy
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });
});
