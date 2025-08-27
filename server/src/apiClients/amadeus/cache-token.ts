import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();


let cachedToken: { token: string; expiry: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiry > now) {
    return cachedToken.token;
  }

    const response = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_SECRET!,
    })
  );

  const data = response.data;

  if (data && data.access_token) {
    cachedToken = {
      token: data.access_token,
      expiry: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.token;
  }

  throw new Error("Failed to retrieve Amadeus token");
}