import { PromisedBroadcastStream } from "./PromisedBroadcastStream";
import { BroadcastStream } from "./BroadcastStream";
import StorageEventListener from "/app/util/StorageEventListener";

export interface StorageBroadcastStreamConfig<T> {
  storage: Storage;
  key: string;
  translator: Translator<T>;
  stream?: BroadcastStream<T>;
}

export class StorageBroadcastStream<T> {
  readonly config: StorageBroadcastStreamConfig<T>;
  readonly stream: BroadcastStream<T>;

  constructor(config: StorageBroadcastStreamConfig<T>) {
    this.config = config;
    this.stream = config.stream || new PromisedBroadcastStream();
  }

  next() {
    const { storage, translator, key } = this.config;

    return Promise.any([
      StorageEventListener.listen(storage, key)
        .next()
        .then((result) => translator.decode(result.value))
        .then((value) => ({ value } as IteratorResult<T>)),
      this.stream.next(),
    ]);
  }

  write(next: T): Promise<void> {
    const value = this.config.translator.encode(next);
    this.config.storage.setItem(this.config.key, value);
    return Promise.resolve();
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

interface Translator<T> {
  encode(_: T): string;
  decode(_: string | null): T | undefined;
}

export const JSONTranslator = {
  encode(val: JSONValue) {
    return JSON.stringify(val);
  },
  decode(val: string | null) {
    return JSON.parse(val || "") as JSONValue;
  },
};
