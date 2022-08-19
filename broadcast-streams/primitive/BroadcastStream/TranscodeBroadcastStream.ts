import { BroadcastStream } from "./BroadcastStream";
import { Transcoder } from "../Transcoder";

interface TranscodeBroadcastStreamConfig<A, B> {
  parent: BroadcastStream<A>;
  coder: Transcoder<B, A>;
}

class TranscodeBroadcastStream<A, B> implements BroadcastStream<B> {
  readonly config: TranscodeBroadcastStreamConfig<A, B>;

  constructor(config: TranscodeBroadcastStreamConfig<A, B>) {
    this.config = config;
  }

  next() {
    return this.config.parent
      .next()
      .then((result) => ({ value: this.config.coder.decode(result.value) }));
  }

  write(next: B): Promise<void> {
    return this.config.parent.write(this.config.coder.encode(next));
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}

/**
 * Re-encode values traveling through the stream.
 */
export function transcode<A, B>(coder: Transcoder<B, A>) {
  return (parent: BroadcastStream<A>) =>
    new TranscodeBroadcastStream({ parent, coder });
}
