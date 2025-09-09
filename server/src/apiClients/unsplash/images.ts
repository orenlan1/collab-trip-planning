import dotenv from "dotenv";
dotenv.config();

export const fetchImageURL = async(query: string) => {
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}`, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    }
  });
  const data = await response.json();
  return data.results[0]?.urls?.small || null;
}