/**
 * Uni-directional mapping of two parameters.
 */
class OneWay<From, To> {
  constructor(mapping: OneWay<From, To>) {
    return Object.assign(mapping, {});
  }
}
interface OneWay<From, To> {
    (_: From): To;
    __proto__?: OneWay<From, To>;
}

export default OneWay;
