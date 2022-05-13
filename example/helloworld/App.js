import { h } from "../../lib/guide-mini-vue.esm.js";

window.self = null;

export const App = {
  render() {
    window.self = this;
    return h("div", { class: "red" }, [
      h("p", { class: "red" }, `${this.msg}`),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
