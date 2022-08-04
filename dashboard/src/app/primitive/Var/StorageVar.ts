import { StoredVar } from "./StoredVar";
import { StorageBroadcastStream } from "../BroadcastStream";

type StorageValue = string | null;

class StorageCell {
  #storage: Storage;
  #key: string;

  constructor(storage: Storage, key: string) {
    this.#storage = storage;
    this.#key = key;
  }

  get(): Promise<StorageValue> {
    return Promise.resolve(this.#storage.getItem(this.#key));
  }
}

export function storage(
  key: string,
  storage: Storage,
): StoredVar<StorageValue> {
  return new StoredVar({
    storage: new StorageCell(storage, key),
    stream: new StorageBroadcastStream({ storage, key }),
  });
}
