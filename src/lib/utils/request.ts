export const getParamsFromObject = (obj: any) => {
  return obj === undefined
    ? []
    : Object.fromEntries(
        Object.entries(obj)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => {
            console.log(`Key: ${key}, Value: ${value}`);
            value = typeof value === "string" ? value : value.toString();

            return [key, value];
          })
      );
};
