interface Gettable<T> {
  /**
   * Gets value
   *
   * @param key
   */
  get(): T;
}

interface Settable<T> {
  /**
   * Sets value
   *
   * @param key
   * @param val
   */
  set(value: T): void;
}

// Use to unsubscribe from updates
type Unsubscribe = () => void;

interface Observable {
  /**
   * Subscribe to updates for a specific key
   *
   * @param key
   * @param callback is called when update occurs
   */
  subscribe(callback: (_: this) => void): Unsubscribe;
}

export type Atom<T> = Gettable<T> & Settable<T>;

export type ObservableAtom<T> = Atom<T> & Observable;

class atom<T> {
  #value: T;

  constructor(initial: T) {
    this.#value = initial;
  }

  get() {
    return this.#value;
  }

  set(val: T) {
    this.#value = val;
  }
}

export function create<T>(): Atom<T | undefined>;
export function create<T>(initial: T): Atom<T> {
  return new atom(initial);
}
