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
   * Subscribe to updates for a specific key.
   *
   * @param key
   * @param callback receives call when event occurs
   * @returns function used to unsubscribe from events
   */
  subscribe(callback: (_: this) => void): Unsubscribe;
}

export type Atom<T> = Gettable<T> & Settable<T>;

export type ObservableAtom<T> = Atom<T> & Observable;

export type MaybeObservableAtom<T> = Atom<T> & Partial<Observable>;

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

export function create<T>(initial: undefined): Atom<T | undefined>;
export function create<T>(initial: T): Atom<T> {
  return new atom(initial);
}

class observer<T> {
  #subscriptions: Set<(_: T) => void> = new Set();

  subscribe(callback: (_: T) => void): Unsubscribe {
    this.#subscriptions.add(callback);
    return () => this.#subscriptions.delete(callback);
  }

  notify(value: T) {
    this.#subscriptions.forEach((subscription) => subscription(value));
  }
}

class observableAtom<T> {
  #delegate: Atom<T>;
  #observer: observer<this>;

  constructor(delegate: Atom<T>) {
    this.#delegate = delegate;
    this.#observer = new observer();
  }

  get(): T {
    return this.#delegate.get();
  }

  set(value: T) {
    this.#delegate.set(value);
    this.#observer.notify(this);
  }

  subscribe(callback: (_: this) => void): Unsubscribe {
    return this.#observer.subscribe(callback);
  }
}

/**
 * Updates given atom allowing consumers to subscribe to updates.
 *
 * @param atom
 * @returns observable atom
 */
export function watch<T>(atom: Atom<T>): ObservableAtom<T> {
  if ("subscribe" in atom) {
    return atom;
  }
  return new observableAtom(atom);
}
