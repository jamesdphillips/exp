import {
  BroadcastStream,
  PromisedBroadcastStream,
} from "/app/primitive/BroadcastStream";

type StorageValue = string | null;
type Unsubscriber = () => void;

function createStorageEventListener(
  callback: (ev: StorageEvent) => void,
): Unsubscriber {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

class StorageEventListener {
  #streams: WeakMap<Storage, Map<string, BroadcastStream<StorageValue>>>;
  #unsub?: Unsubscriber;

  constructor() {
    this.#streams = new WeakMap();
  }

  // TODO: unsubscribe!
  // TODO: keep ref count and close unused streams
  // TODO: can likely simplify lazy initialization
  listen(storage: Storage, key: string): AsyncIterableIterator<StorageValue> {
    let map = this.#streams.get(storage);
    if (!map) {
      map = new Map();
      this.#streams.set(storage, map);
    }
    let stream = map.get(key);
    if (!stream) {
      stream = new PromisedBroadcastStream();
      map.set(key, stream);
    }
    return stream;
  }

  start() {
    if (!this.#unsub) {
      console.debug(
        "StorageEventListener",
        "start()",
        "service appears to have already started",
      );
      return;
    }
    this.#unsub = createStorageEventListener((storageEv) => {
      if (!storageEv.storageArea || !storageEv.key) {
        return;
      }
      const map = this.#streams.get(storageEv.storageArea);
      if (!map) {
        return;
      }
      const stream = map.get(storageEv.key);
      if (!stream) {
        return;
      }
      stream.write(storageEv.newValue);
    });
  }

  stop() {
    this.#unsub && this.#unsub();
    this.#unsub = undefined;
  }
}

class StorageEventListenerSingleton extends StorageEventListener {
  listen(storage: Storage, key: string): AsyncIterableIterator<StorageValue> {
    this.start();
    return super.listen(storage, key);
  }
}

const listener = new StorageEventListenerSingleton();
export default listener;
