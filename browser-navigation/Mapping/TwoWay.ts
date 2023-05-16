/**
 * Maps one record to another
 */
class TwoWay<From, To> extends Function {
  static readonly test = "test";
}

interface TwoWay<From, To> {
    (_: From): To;
    __proto__?: TwoWay<From, To>;
};
export default TwoWay;
