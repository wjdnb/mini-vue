import { reactive, wa } from "./reactive";

const user = reactive({
  age: 10,
});

let nextAge;
watchEffect(() => {
  nextAge = user.age + 1;
});

user.age++;
