export const getFormatedCurrency = (
  amount: number,
  currency: string
): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};
