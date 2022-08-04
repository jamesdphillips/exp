interface Encoder<A, B> {
  encode(_: A): B;
}

interface Decoder<A, B> {
  decode(_: B): A;
}

export type Transcoder<A, B> = Encoder<A, B> & Decoder<A, B>;

export function cast<A, B>(coder: Transcoder<A, B>): Transcoder<A, B> {
  return coder;
}

export function combine<A, B>(
  encoder: Encoder<A, B>,
  decoder: Decoder<A, B>,
): Transcoder<A, B> {
  return {
    ...encoder,
    ...decoder,
  };
}

export function flip<A, B>(coder: Transcoder<A, B>): Transcoder<B, A> {
  return {
    ...coder,
    encode: coder.decode,
    decode: coder.encode,
  };
}

export const json: Transcoder<JSONValue, string | null> = {
  encode(val: JSONValue) {
    return JSON.stringify(val);
  },
  decode(val: string | null) {
    return JSON.parse(val || "") as JSONValue;
  },
};

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;
