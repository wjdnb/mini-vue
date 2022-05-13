import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("div", { class: "red" }, [h("p", { class: "red" }, "hello")]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
