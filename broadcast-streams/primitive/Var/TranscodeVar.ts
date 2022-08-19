import { Var } from "./Var";

interface Encoder<A, B> {
  encode(_: A): B;
}

interface Decoder<A, B> {
  decode(_: B): A;
}

type Transcoder<A, B> = Encoder<A, B> & Decoder<A, B>;

interface TranscodeVarConfig<A, B> {
  parent: Var<A>;
  coder: Transcoder<B, A>;
}

class TranscodeVar<A, B> {
  readonly config: TranscodeVarConfig<A, B>;

  constructor(config: TranscodeVarConfig<A, B>) {
    this.config = config;
  }

  get(): Promise<B> {
    return this.config.parent.get().then(this.config.coder.decode);
  }

  set(next: B) {
    return this.config.parent.set(this.config.coder.encode(next));
  }
}

/**
 * Re-encode values traveling through the stream.
 */
export function transcode<A, B>(coder: Transcoder<B, A>) {
  return (parent: Var<A>) => new TranscodeVar({ parent, coder });
}
