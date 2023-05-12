type OmitFirstArg<T> = T extends (arg1: any, ...args: infer R) => infer U
  ? (...args: R) => U
  : never;

export type CurryInterface<T> = {
  [P in keyof T]: OmitFirstArg<T[P]>;
};

export function curry<T extends object>(
  target: T,
  arg: any
): CurryInterface<T> {
  return new Proxy(target, {
    get(target, prop) {
      return target[prop](arg)(arg, ...arguments);
    },
  }) as CurryInterface<T>;
}

export function pick<T extends object, K extends keyof T>(
  target: T,
  ...args: K[]
) {
  return Object.fromEntries(
    Object.entries(target).filter(([key]) => args.includes(key as any))
  ) as Pick<typeof target, (typeof args)[number]>;
}