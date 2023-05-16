import { curry, pick } from "../Object/en";

interface Dictionary<W, T> {
  get(word: W): T | null;
  set(word: W, entry: T | null): void;

  getAll(word: W): T[];
  append(word, entry: T): void;
}

interface DictionaryEntry<T> {
  get(): T | null;
  set(entry: T | null): void;
}

export type I<W, T> = Dictionary<W, T>;
export type Entry<T> = DictionaryEntry<T>;

/**
 * Given a word returns a mapping of a dictionary to an entry within.
 *
 * @param word
 * @returns entry
 */
export function reroot<W, T>(source: Dictionary<W, T>, word: W) {
  return curry(pick(source, "get", "set"), word) as Omit<
    typeof source,
    "get" | "set"
  > &
    Entry<T>;
}

/**
 * Given a word returns a mapping of a dictionary to zero or more entries
 * within.
 *
 * @param word
 * @returns entry
 */
export function rerootList<W, T>(source: Dictionary<W, T>, word: W) {
  return {
    ...source,
    get(): T[] {
      return source.getAll(word);
    },
    set(vs: T[]) {
      source.set(word, null);
      vs.forEach((v) => source.append(word, v));
    },
  } as typeof source & Entry<T[]>;
}

// const entry = reroot("test")(new URLSearchParams());
// entry.get();
