declare module 'currency-symbol-map' {
  function getSymbolFromCurrency(currencyCode: string): string | undefined;
  export = getSymbolFromCurrency;
}
