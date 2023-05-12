import { curry, pick } from "../Object/en";

import { Mapping } from "../Mapping/en";
import { Iface } from "../Reversible/en";

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
export const reroot =
  <W>(word: W) =>
  <T>(source: Dictionary<W, T>) =>
    curry(pick(source, "get", "set"), word);

/**
 * Given a word returns a mapping of a dictionary to zero or more entries
 * within.
 *
 * @param word
 * @returns entry
 */
export const rerootList =
  <W>(word: W) =>
  <T>(source: Dictionary<W, T>) => ({
    get(): T[] {
      return source.getAll(word);
    },
    set(vs: T[]) {
      source.set(word, null);
      vs.forEach(v => source.append(word, v));
    },
  } as DictionaryEntry<T[]>)

// const entry = reroot("test")(new URLSearchParams());
// entry.get();
