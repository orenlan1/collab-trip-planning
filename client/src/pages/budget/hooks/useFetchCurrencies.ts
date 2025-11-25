import { useState, useEffect } from 'react';
import { budgetApi } from '../services/budgetApi';
import type { Currency } from '@/types/currency';
import { getCurrencySymbol } from '@/lib/currency';

interface UseFetchCurrenciesReturn {
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and manage currencies list
 * Automatically adds currency symbols on the client side
 * @returns Object containing currencies array, loading state, and error
 */
export const useFetchCurrencies = (): UseFetchCurrenciesReturn => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async (): Promise<void> => {
      // Only fetch if we haven't already loaded currencies
      if (currencies.length > 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await budgetApi.getCurrencies();
        // Add symbols to currencies on the client side
        const currenciesWithSymbols = response.data.data.map(curr => ({
          ...curr,
          symbol: getCurrencySymbol(curr.code)
        }));
        setCurrencies(currenciesWithSymbols);
      } catch (err) {
        console.error('Failed to load currencies:', err);
        setError('Failed to load currencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []); // Empty dependency array - only fetch once on mount

  return { currencies, isLoading, error };
};
