type Primitive = string | number | boolean | symbol | BigInt | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? T[P] extends Function
        ? T[P]
        : DeepPartial<T[P]>
      : T[P]
};

type IsPlainObject<T> = T extends object
  ? T extends Function
    ? false
    : T extends any[]
      ? false
      : true
  : false;

type DeepMerged<T, U> = {
  [K in keyof T | keyof U]: K extends keyof T // K is key of T
    ? K extends keyof U
      ? U[K] extends undefined    // if U[K] is undefined, use T[K]
        ? T[K]        
        : IsPlainObject<T[K]> extends true
          ? IsPlainObject<U[K]> extends true  // if T[K],U[K] is object, merge
            ? DeepMerged<T[K], U[K]>
            : U[K]
          : U[K]
      : T[K] // K is not keyof U (== keyof T)
    : never // K is not key of T and U
};


export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null
    || typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean"
    || typeof value === "symbol"
    || typeof value === "bigint"
    || typeof value === "undefined"
  );
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

/**
 * merge, a deepmerge implementation.
 * 
 * - target immutable
 * - prototype aware
 * - circular ref aware
 * - replace array (no-join)
 * - ignore unenumerable properties
 * - ignore undefined
 * 
 * @param target target type 
 * @param source source type
 * @returns merged object (target + source)
 */
export function merge<T, U>(target: Partial<T>, source?: Partial<U>): DeepMerged<T, U> {
  const seen = new WeakMap<object, any>();

  function _merge(target: any, source: any): any {
    if (seen.has(source)) {
      return seen.get(source);
    }
    else if (isPrimitive(source) || isFunction(source)) {
      return source;
    }
    else if (Array.isArray(source)) {
      const result = source.map(item => _merge(undefined, item));
      seen.set(source, result);
      return result;
    }
    else if (typeof source === "object") {
      const result = { ...target };
      seen.set(source, result);
  
      for (const key of Object.keys(source)) {
        // Skip dangerous keys
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          continue;
        }
        const value = source[key];
        const merged = _merge(result[key], value);
        if (merged !== undefined) {
          result[key] = merged;
        }
      }
      return result;
    }
    else {
      return undefined; // ?
    }
  }

  const merged = _merge(target, source);
  return merged === undefined
    ? target as DeepMerged<T, U>
    : merged;
}
