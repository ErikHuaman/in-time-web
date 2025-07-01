export const sanitizedForm = (rawValue: Object) => {
  return Object.fromEntries(
    Object.entries(rawValue).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  );
};
