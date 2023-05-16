import _TwoWay from "./TwoWay.ts";

/**
 * Maps one record to another
 */
class Mapping<From, To> extends Function {
  static readonly TwoWay = _TwoWay;
}

interface Mapping<From, To> {
    (_: From): To;
    __proto__?: Mapping<From, To>;
}
export default Mapping;
