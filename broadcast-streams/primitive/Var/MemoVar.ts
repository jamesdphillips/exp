import { Var } from "./Var";
import { BroadcastStream, PromisedBroadcastStream } from "../BroadcastStream";

interface MemoVarConfig<T> {
  initial: T;
  stream?: BroadcastStream<T>;
}

export class MemoVar<T> implements Var<T> {
  #stream: BroadcastStream<T>;
  #prevValue: T;

  constructor(config: MemoVarConfig<T>) {
    this.#stream = config.stream ?? new PromisedBroadcastStream();
    this.#prevValue = config.initial;
  }

  get(): Promise<T> {
    return Promise.resolve(this.#prevValue);
  }

  set(nextVal: T): Promise<void> {
    this.#prevValue = nextVal;
    return this.#stream.write(nextVal);
  }

  [Symbol.asyncIterator]() {
    return this.#stream[Symbol.asyncIterator]();
  }
}

export function createMemoVar<T>(initial?: T): MemoVar<typeof initial>;
export function createMemoVar<T>(
  initial: T,
  stream?: BroadcastStream<typeof initial>,
): MemoVar<typeof initial> {
  return new MemoVar<typeof initial>({ initial, stream });
}
