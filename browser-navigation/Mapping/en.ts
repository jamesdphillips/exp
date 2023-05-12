/**
 * Maps one record to another
 */
export type Mapping<From, To> = (_: From) => To;
