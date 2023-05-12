import { SetFn, GetFn } from "../core/en";
import { Mapping } from "../Mapping/en";
import * as Reversible from "../Reversible/en";
import * as Dictionary from "../Dictionary/en";
import * as BMaps from "../strconv/bmap";

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

export function local<T>(impl: T = 0 as any): Variable<T> {
  return {
    get: () => impl,
    set(next: T) {
      impl = next;
    },
  };
}

interface Locationable {
  location: Location;
}
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

export function extract<Obj extends object, Prop extends keyof Obj>(
  obj: Obj,
  prop: Prop
): Variable<Obj[Prop]> {
  return Object.getOwnPropertyDescriptor(obj, prop) as Variable<Obj[Prop]>;
}

export function defineProperty<
  T,
  Target extends object,
  Props extends PropertyKey
>(target: Target, prop: Props, impl: Variable<T>) {
  return Object.defineProperty(target, prop, impl) as Target & Record<Props, T>;
}

// const x = location();
// const y = Object.defineProperty(x, "test", x);
// const z = defineProperty(x, "test", x);

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
  v.get = () => tap((v: T["get"]) => console.log(v))(v.get());
  v.set = (val: T["set"]) => {
    console.log("<logger />", val);
    v.set(val);
  };
  return v;
}

// const a: HrefableVariable<URLSearchParams> = null;
// const b = logger(a);

// function

// function useURLSearchParams(): HrefableVariable<URLSearchParams> {
//   // connect to react-router, et al.
// }

type Transformed<V, M> = Omit<V, "get" | "set"> & Variable<M>;

/**
 * Transforms a given variable using a bi-drectional mapping.
 *
 * @example
 *
 * const Variable<URLSearchParams> a = Var.local(new URLSearchParams);
 * let b = transform(a, Reversible.tag(c => c.entries(), d => new URLSearchParams(...d)));
 *
 * const Variable<URLSearchParams> a = Var.local(window.location);
 * let b = transform(a, Reversible.tag(c => href, d => new URLSearchParams(...d)));
 *
 * @param bmap
 * @returns Mapping<Variable>
 */
export const transform =
  <T, M>(bmap: Reversible.Iface<Mapping<T, M>>) =>
  (v: Variable<T>) =>
    ({
      ...v,
      get: Object.assign({}, v.get, () => bmap(v.get())),
      set: Object.assign({}, v.set, (val) => {
        // TODO: Can/should we be able to have uni-directional maps?
        const reverse = Reversible.unwrap(bmap);
        const reversed = reverse ? reverse(val) : v.get();
        v.set(reversed);
      }),
    } as Transformed<typeof v, M>);

//
// const t0: Mapping<string, number> = (n: string) => parseInt(n, 10);
// const t1: Mapping<number, string> = (n: number) => n.toString();
// const t2 = Reversible.tag(t0, t1);

//
// [Dictionary.rerootList("preset"), transform(BMaps.list()), preset([])];
