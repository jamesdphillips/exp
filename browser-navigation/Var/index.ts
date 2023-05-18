import { SetFn, GetFn } from "../core/index.ts";
import * as Mapping from "../Mapping/index.ts";
// import * as Hrefable from "../Hrefable/index.ts";
// import * as Dictionary from "../Dictionary/en.ts";
// import * as BMaps from "../strconv/bmap.ts";

// import { pipe } from "../function/index.ts";

/**
 * Given a value and a preset, one of the two is selected based on whether
 * the input value is falsey.
 *
 * @example
 *
 * const entry = Dictionary.rerootList("one")(new URLSearchParams());
 * entry.get();
 *
 * @param input
 * @param preset
 * @return input | preset
 */
export function preset<T>(val: T): (x: undefined) => typeof val;
export function preset<T>(val: T): (x: T) => T {
  return (x) => x || val;
}

export interface Variable<
  Value,
  Getter extends () => Value = GetFn<Value>,
  Setter extends (_: Value) => void = SetFn<Value>
> {
  get: Getter;
  set: Setter;
}

// const v0: Variable<string> = {
//   get() {
//     return "true";
//   },
//   set(v: string) {
//     console.debug(v);
//   },
// };

// interface Encoder<L, R> {
//   encode(L): R;
// }

// interface Decoder<L, R> {
//   decode(L): R;
// }

// type Codec<L, R> = Encoder<L, R> & Decoder<L, R>;

// function transform<L, R>(source: L, transformer: Codec<L, R>): R {
//   return transformer.decode(transformer.encode(source));
// }

// const v: HrefableVariable<URLSearchParams> = {} as any;
// const f = v.set[href](new URLSearchParams("?123"));

// const y: HrefableVariable<URLSearchParams>;
// const z = y.set[href];

/**
 * Given value returns object that implements variable interface.
 *
 * @param initial value
 * @returns Variable<T>
 */
export function local<T>(impl: T = undefined as T): Variable<T> {
  return {
    get: () => impl,
    set(next: T) {
      impl = next;
    },
  };
}

/**
 * When you want a variable for a type that isn't a primitive or immutable.
 *
 * @param initial
 * @param copier should provide a new copy of the given value
 * @returns Variable<T>
 */
export function copy<T>(impl: T, fn: (_: T) => T) {
  return {
    get: () => fn(impl),
    set(next: T) {
      impl = next;
    },
  };
}

interface Location {
  toString(): string;
  replace(url: string): void;
}
interface Locationable {
  location: Location;
}

/**
 * Given locationable object returns a variable.
 *
 * @param locationable object
 * @returns Variable<T>
 */
export function location(impl: Locationable = window): Variable<URL> {
  return {
    get() {
      return new URL(impl.location.toString());
    },
    set(url: URL) {
      impl.location.replace(url.toString());
    },
  };
}

// const num: { one: number } = { one: 1 };
// const myVar = extract(num, "one");

/**
 * Extracts a property from the given object.
 *
 * @param source
 * @param prop
 * @returns
 */
export function extract<Obj extends object, Prop extends keyof Obj>(
  source: Obj,
  prop: Prop
) {
  return {
    get: () => source[prop],
    set: (v: (typeof source)[typeof prop]) => (source[prop] = v),
  } as Variable<Obj[typeof prop]>;
}

type WithProp<Target, Prop extends PropertyKey, T> = Omit<Target, Prop> &
  Record<Prop, T>;

/**
 * Attach a variable to the given object.
 *
 * Works the same as Object.defineProperty but returned type includes the given
 * property type definition.
 *
 * @example
 *
 * const x = local("123");
 * const y = Object.defineProperty(x, "test", x);
 * const z = defineProperty(x, "test", x);
 *
 * y.test = "321";
 * z.test = "042";
 *
 * @param target to attach property to
 * @param name of the property to attach
 * @param variable to attach
 * @returns WithProp<typeof target, typeof name, T>
 */
export function defineProperty<
  T,
  Target extends object,
  Prop extends PropertyKey
>(target: Target, prop: Prop, impl: Variable<T>) {
  const next = Object.defineProperty(target, prop, impl);
  return next as WithProp<typeof target, typeof prop, T>;
}

type Proxy<T> = (_: T) => T;

function tap<V>(fn: (_: V) => any) {
  return (v: V) => {
    fn(v);
    return v;
  };
}

/**
 * Hrefable
 *
 * - we need the receiver chain!
 *
 */

/**
 * The translator takes one type and replaces it with another
 *
 * - translator needs to take the bidirectional mapping
 * - we can't lose any properties associated with the input, eg. Hrefable<>
 */

export function logger<T extends Variable<any>>(v: T): T {
  v.get = () => tap((v: T["get"]) => console.log("<logger />", v))(v.get());
  v.set = (val: T["set"]) => {
    console.log("<logger />", val);
    v.set(val);
  };
  return v;
}

// const a: Hrefable.Var<URLSearchParams> = null;
// const b = transform()

// function

// function useURLSearchParams(): HrefableVariable<URLSearchParams> {
//   // connect to react-router, et al.
// }

// type Transformed<V extends Variable<any>, M> = Omit<V, "get" | "set"> & Variable<M>;
interface Transformed<V extends Variable<any>, M> {
  get: TransformedGet<V, M>;
  set: TransformedSet<V, M>;
}

type TransformedGet<V extends Variable<any>, M> = FunctionProps<V["get"]> &
  GetFn<M>;
type TransformedSet<V extends Variable<any>, M> = FunctionProps<V["set"]> &
  SetFn<M>;

type Func<P extends any[], R> = (...args: P) => R;
type AnyFunc = Func<any, any>;
type FunctionProps<F> = { [K in Exclude<keyof F, keyof Function>]: F[K] };
type AssignedFunc<Prev, Next> = FunctionProps<Prev> & Next;

function assignFn<T extends AnyFunc, Func extends AnyFunc>(
  target: T,
  fn: Func
) {
  return Object.assign(fn, target) as AssignedFunc<typeof target, typeof fn>;
}

/**
 * Transforms a given variable using a bi-drectional mapping.
 *
 * @example
 *
 * const Variable<URLSearchParams> a = Var.local(new URLSearchParams);
 * let b = transform(a, Reversible.embed(c => c.entries(), d => new URLSearchParams(...d)));
 *
 * const Variable<URLSearchParams> a = Var.local(window.location);
 * let b = transform(a, Reversible.embed(c => href, d => new URLSearchParams(...d)));
 *
 * @param mapping
 * @returns Mapping<Variable>
 */
export function transform<M, Var extends Variable<any> = any>(
  variable: Var,
  mapping: Mapping.TwoWay<any, M>,
) {
  return Object.assign({}, variable, {
    get: assignFn(variable.get, () => mapping(variable.get())),
    set: assignFn(variable.set, (val: M) => {
      variable.set(Mapping.TwoWay.apply(mapping, val));
    }),
  }) as Transformed<typeof variable, M>;
}
  // ({
  //   ...variable,
  //   get: assignFn(variable.get, () => bmap(variable.get())),
  //   set: assignFn(variable.set, (val: M) => {
  //     variable.set(Reversible.apply(bmap, val));
  //   }),
  // } as Transformed<typeof variable, M>);

// type Nomable<T> = T & {
//   nom: string;
// };

// export interface NomableVar<T> extends Variable<T> {
//   set: Nomable<Variable<T>["set"]>;
// }

// const a: Hrefable.Var<string | undefined> = local("10");
// const d: { num?: number } = { num: 42 };
// const c = transform(a, BMaps.number());
// c.get();
// c.set(d.num);
// const fn = Hrefable.get(c.set);

// const t10 = Object.assign({}, a.set, () => true);

// type Proxied<V extends Variable<T>, T> = {};

export const transpose = <V extends Variable<any>, R extends Variable<any>>(
  src: V,
  fn: (v: ReturnType<(typeof src)["get"]>) => R
) =>
  ({
    ...src,
    get: assignFn(src.get, () => fn(src.get()).get()),
    set: assignFn(src.set, (arg: ReturnType<ReturnType<typeof fn>["get"]>) => {
      // take a copy we'll use to capture changes
      const copy = src.get();
      const impl = fn(copy);

      // pass along result
      impl.set(arg);
      src.set(copy);
    }),
  } as Transformed<typeof src, ReturnType<ReturnType<typeof fn>["get"]>>);

// const t20: Hrefable.Var<URLSearchParams> = local(new URLSearchParams("?one=1"));
// const rerootToOne = (x: URLSearchParams) => Dictionary.reroot(x, "one");
// const t = transpose(t20, rerootToOne);
// t.set(null);
// const fn0 = Hrefable.get(t.set);
// console.log(fn0(null));

//
// const t0: Mapping<string, number> = (n: string) => parseInt(n, 10);
// const t1: Mapping<number, string> = (n: number) => n.toString();
// const t2 = Reversible.tag(t0, t1);

//
// [Dictionary.rerootList("preset"), transform(BMaps.list()), preset([])];
