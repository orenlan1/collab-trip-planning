import dotenv from 'dotenv';

dotenv.config();

export async function convertCurrency(fromCurrency: string,
     toCurrency: string, amount: number): Promise<any> {
  
        if (fromCurrency === toCurrency) {
            return { result: amount  };
        }

        const baseUrl = 'https://api.unirateapi.com/api';
        const url = `${baseUrl}/convert?api_key=${process.env.UNIRATE_API_KEY}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
}