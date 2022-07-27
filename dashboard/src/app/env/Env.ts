interface Gettable<T> {
  get(): T;
}

interface Settable<T> {
  set(): T;
}

type Atom<T> = Gettable<T> & Settable<T>;

interface KeyedAtom<K, V> extends Atom<V> {
  key(): K;
}

type Unsubscribe = () => void;

export interface Env<T extends Record<string, any> = Record<string, never>> {
  /**
   * Gets value
   *
   * @param key
   */
  get(key: string): T;

  /**
   * Sets value
   *
   * @param key
   * @param val
   */
  set(key: string, val?: T): void;

  /**
   * Subscribe to updates for a specific key
   *
   * @param key
   * @param callback is called when update occurs
   */
  subscribe(key: string, callback: (_: this) => void): Unsubscribe;

  /**
   * Implements iterable protocol
   *
   * @example
   *
   * interface Node {
   *   kind: "string";
   *   value: string;
   * }
   *
   * const env: Env<Node>;
   * for (const item of env) {
   *   if (item.key() !== "kind") {
   *     continue;
   *   }
   *   console.info("Node" + item.get());
   *   break;
   * }
   */
  [Symbol.iterator]: () => Iterator<KeyedAtom<keyof T, T[keyof T]>>;
}

interface MapGetter<T extends Record<any, any>> {
  /**
   * Gets value
   *
   * @param key
   */
  get<K extends keyof T>(key: K): T[K];
}

interface MapSetter<T extends Record<any, any>> {
  /**
   * Sets value
   *
   * @param key
   * @param val
   */
  set<K extends keyof T>(key: K, val?: T[K]): void;
}

interface MapWatcher<T extends Record<any, any>> {
  /**
   * Subscribe to updates for a specific key
   *
   * @param key
   * @param callback is called when update occurs
   */
  subscribe(key: keyof T, callback: (_: this) => void): Unsubscribe;
}

interface Map<T extends Record<any, any>> extends MapGetter<T> {
  /**
   * Implements iterable protocol
   *
   * @example
   *
   * interface Node {
   *   kind: "string";
   *   value: string;
   * }
   *
   * const env: Env<Node>;
   * for (const item of env) {
   *   if (item.key() !== "kind") {
   *     continue;
   *   }
   *   console.info("Node" + item.get());
   *   break;
   * }
   */
  [Symbol.iterator]: () => Iterator<KeyedAtom<keyof T, T[keyof T]>>;
}

type MutableMap<T extends Record<any, any>> = Map<T> & MapSetter<T>;

type WatchableMap<T extends Record<any, any>> = Map<T> & MapWatcher<T>;

type WatchableMutableMap<T> = MutableMap<T> & WatchableMap<T>;

function makeMap()