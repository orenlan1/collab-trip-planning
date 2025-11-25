import getSymbolFromCurrency from 'currency-symbol-map';

/**
 * Get currency symbol from currency code
 * @param currencyCode - Currency code (e.g., 'USD')
 * @returns Currency symbol (e.g., '$') or the code itself if symbol not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  return getSymbolFromCurrency(currencyCode) || currencyCode;
}

/**
 * Format amount with currency symbol
 * @param amount - Amount to format
 * @param currencyCode - Currency code
 * @returns Formatted string with currency symbol
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formattedAmount}${symbol}`;
}

 