export { default as OneWay } from "./OneWay.ts";
export { default as TwoWay } from "./TwoWay.ts";

/**
 * Maps one record to another
 */
class Mapping<From, To> extends Function {}
interface Mapping<From, To> {
    (_: From): To;
    __proto__?: Mapping<From, To>;
}

export default Mapping;
