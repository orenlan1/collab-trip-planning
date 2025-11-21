import currencyCodes from 'currency-codes';

export interface Currency {
  code: string;
  name: string;
}

/**
 * Get all available currencies with their codes and names
 * @returns Array of currency objects
 */
export const getAllCurrencies = (): Currency[] => {
  const currencies = currencyCodes.data;
  
  return currencies
    .map((currency) => ({
      code: currency.code,
      name: currency.currency,
    }))
    .filter((currency) => currency.code && currency.name) // Filter out invalid entries
    .sort((a, b) => a.code.localeCompare(b.code)); // Sort alphabetically by code
};

/**
 * Get a specific currency by code
 * @param code - Currency code (e.g., 'USD')
 * @returns Currency object or null if not found
 */
export const getCurrencyByCode = (code: string): Currency | null => {
  const currency = currencyCodes.code(code);
  
  if (!currency) {
    return null;
  }

  return {
    code: currency.code,
    name: currency.currency,
  };
};

/**
 * Validate if a currency code exists
 * @param code - Currency code to validate
 * @returns boolean indicating if the code is valid
 */
export const isValidCurrencyCode = (code: string): boolean => {
  return currencyCodes.code(code) !== undefined;
};
