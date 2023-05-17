import Reversible from "../Reversible/index.ts";
import OneWay from "./OneWay.ts";

/**
 * Bi-directional mapping of two parameters.
 * 
 * @example
 * 
 * const to = (x: string) => parseInt(x, 10);
 * const fro = (x: string) => parseInt(x, 10);
 * const mapping = new TwoWay(to, fro);
 * 
 * console.log(mapping(10));
 * console.log(mapping(10));
 * 
 */
class TwoWay<From, To> extends Reversible<OneWay<From, To>> {
  constructor(forward: OneWay<From, To>, reverse: OneWay<To, From>) {
    super();
    return Reversible.embed(forward, reverse) as this;
  }
}
interface TwoWay<From, To> extends Reversible<OneWay<From, To>> {
  __proto__?: TwoWay<From, To>;
}

export default TwoWay;
