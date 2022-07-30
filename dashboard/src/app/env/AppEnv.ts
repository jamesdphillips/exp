import { Env } from "./Env";

function join(prefix: string, separator: string, key: string) {
  return prefix + separator + key;
}

type Unsubscribe = () => void;

namespace PrefixedEnvFactory {
  const defaultSeparator = "_";

  type Obj = Record<string, any>;

  export function get<T extends Obj>(
    prefix: string,
    separator = defaultSeparator,
  ) {
    return function getter<K extends keyof T>(
      env: Env,
      key: string & K,
    ): T[K] | undefined {
      return env.get(join(prefix, separator, key)) as T[K];
    };
  }

  export function set<T extends Obj>(
    prefix: string,
    separator = defaultSeparator,
  ) {
    return function setter<K extends keyof T>(
      env: Env,
      key: string & K,
      val: T[K],
    ) {
      return env.set(join(prefix, separator, key), val);
    };
  }

  export function subscribe<T extends Obj>(
    prefix: string,
    separator = defaultSeparator,
  ) {
    return function subscriber<K extends keyof T>(
      env: Env,
      key: string & K,
      callback: (_: Env<T>) => void,
    ): Unsubscribe {
      return env.subscribe(
        join(prefix, separator, key),
        callback as (_: Env<Record<string, never>>) => void,
      );
    };
  }
}

namespace AppEnv {
  export interface Values {
    name: Promise<string>;
    desc: Promise<string>;
    age: Promise<number>;
  }

  export const prefix = "1234567890";

  // export function get<K extends keyof Values>(env: Env, key: K): Values[K] {
  //     return env.get(prefix + "_" + key);
  // }
  export const get = PrefixedEnvFactory.get<Values>(prefix);
  export const set = PrefixedEnvFactory.set<Values>(prefix);
  // export const iterable;
}

export default AppEnv;
