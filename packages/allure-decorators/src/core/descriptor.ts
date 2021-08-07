export const processDescriptor = <T>(
  parameterFn: string | ((arg: T) => string),
  reporterFn: (arg: string) => void,
  descriptor: PropertyDescriptor,
  propsFilter: (arg: string) => boolean = () => true,
): PropertyDescriptor => {
  const original: any = descriptor.value;
  if (typeof original === "function") {
    descriptor.value = function(...args: [T]) {
      try {
        const value: string =
          typeof parameterFn === "function" ? parameterFn.apply(this, args) : parameterFn;
        reporterFn(value);
      } catch (e) {
        /* eslint-disable no-console */
        console.error(`[ERROR] Failed to apply decorator: ${e}`);
      }
      return original.apply(this, args);
    };
  }

  for (const prop of Object.keys(original)) {
    if (Object.prototype.hasOwnProperty.call(original, prop) && propsFilter(prop)) {
      descriptor.value[prop] = original[prop];
    }
  }

  return descriptor;
};
