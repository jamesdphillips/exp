import { Maybe, Binding } from "../core/index.ts";

type OmitFirstArg<T> = T extends (arg1: any, ...args: infer R) => infer U
  ? (...args: R) => U
  : never;

export type CurriedInterface<T> = {
  [P in keyof T]: OmitFirstArg<T[P]>;
};

/**
 * Returns a copy of the given object where all the properties have been seeded
 * with the given parameter.
 *
 * @example
 *
 * const x = {
 *   get(key: string) {
 *     if (key === "life") {
 *       return 42;
 *     }
 *     return 7;
 *   },
 * };
 * const y = curry(x, "life");
 * const z = y.get(); // 42
 *
 * @param source
 * @param parameter
 * @returns CurriedInterface<T>
 */
export function curry<T extends Record<PropertyKey, any>>(
  source: T,
  arg: any
): CurriedInterface<T> {
  return new Proxy(source, {
    get(target, prop: PropertyKey) {
      const ref: Maybe<Binding<T[keyof T]>> = target[prop] && {
        value: target[prop],
      };
      console.log(target, prop);
      return (...args: Parameters<T[typeof prop]>) => {
        ref?.value(arg, ...args);
        console.log(target, prop, "(", arg, ...args, ")");
      };
    },
  }) as CurriedInterface<T>;
}

/**
 * Returns copy of the source object with only given property keys intact.
 *
 * @example
 *
 * const x = {
 *   x: 1,
 *   y: 2,
 *   z: 3,
 * }
 * const y = pick(x, "x", "y")
 * const z = x.z; // undefined
 *
 * @param source
 * @param props
 * @returns Pick<T, K>
 */
export function pick<T extends object, K extends keyof T>(
  source: T,
  ...props: K[]
) {
  return props.reduce(
    (acc, prop) => Object.defineProperty(acc, prop, { value: source[prop] }),
    {}
  ) as Pick<typeof source, (typeof props)[number]>;
}
