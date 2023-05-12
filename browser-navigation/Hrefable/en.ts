import { Variable } from "../Var/en";

const symbol = Symbol("href");

type Hrefable<
  Fn extends (...any) => any,
  Params extends Parameters<Fn> = Parameters<Fn>
> = Fn & {
  [symbol]: (...Params) => URL;
};

export interface Var<T> extends Variable<T> {
  set: Hrefable<Variable<T>["set"]>;
}

export function tag<T extends (...any) => any, Params extends Parameters<T>>(
  fn: T,
  impl: (...Params) => URL
) {
  fn[symbol] = impl;
  return fn as Hrefable<T>;
}

export default Hrefable;