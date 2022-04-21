import { effect } from "../effect";
import { reactive } from "../reactive";

// 这里 effect 函数里面引用了 reactive 里面的值
// 在这个引用值改变了之后，需要重新触发这个 effect 函数

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
});
