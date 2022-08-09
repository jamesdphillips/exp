import { BroadcastStream } from "./BroadcastStream";
import { PromisedBroadcastStream } from "./PromisedBroadcastStream";
import { returnable } from "../Promise";

async function take<T = any>(stream: BroadcastStream<T>, count: number) {
  const collection: Array<T> = [];
  for await (const msg of stream) {
    collection.push(msg);
    if (count-- < 0) {
      break;
    }
  }
  return collection;
}

function writeEvery<T>(
  stream: BroadcastStream<typeof msg>,
  durationMS: number,
  msg?: T,
) {
  const id = setInterval(() => stream.write(msg), durationMS);
  return () => clearInterval(id);
}

async function sleep(ms: number) {
  const promise = returnable();
  setTimeout(() => promise.resolve(0), ms);
  await promise;
}

describe("PromisedBroadcastStream", () => {
  it("broadcasts messages", async () => {
    const ctrl = new AbortController();
    const stream = new PromisedBroadcastStream<string>();

    const stop = writeEvery(stream, 100, "message");
    const results = take(stream, 5);
    await sleep(1000);
    ctrl.abort();
    stop();

    expect(await results).toBe(true);
  });
});
