interface Ref<T> {
  current: T;
}

const x: Ref<number> = {
  current: 123,
}

const desc = Object.getOwnPropertyDescriptor(x, "current");
desc?.configurable;
