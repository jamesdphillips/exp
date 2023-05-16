import { Variable } from "../Var/index.ts";

const symbol = Symbol("href");

type Hrefable<
  Fn extends (...args: any) => any,
  Params extends Parameters<Fn> = Parameters<Fn>
> = Fn & {
  [symbol]: (...args: Params) => URL;
};

export interface Var<T> extends Variable<T> {
  set: Hrefable<Variable<T>["set"]>;
}

export function tag<T extends (...args: any) => any, Params extends Parameters<T>>(
  fn: T,
  impl: (...args: Params) => URL
) {
  return { ...fn, [symbol]: impl } as Hrefable<T>;
}

interface Hrefified<Params extends any[]> {
  [symbol]: (...args: Params) => URL;
}

export function get<Fn extends Hrefified<any> & ((...args: T) => any), T extends any[]>(
  fn: Fn,
) {
  return fn[symbol] as (...args: Parameters<typeof fn>) => URL
}

export default Hrefable;