import OpenAI from "openai";
import dotenv from "dotenv";
import { getRestaurants } from "../google-maps/places";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Location {
    latitude: number;
    longitude: number;
}

interface Restaurant {
    name: string;
    description: string;
    cuisine: string;
    address: string;
    location: Location;
    whyRecommended: string;
}

interface DiningSuggestionsResponse {
    query: string;
    restaurants: Restaurant[];
}

export async function getDiningSuggestions(query: string, destination: string): Promise<DiningSuggestionsResponse> {
    const systemPrompt = `You are a travel and food recommendation assistant.

Your task is to analyze restaurant data from Google Maps and recommend the top 5 restaurants that best match the user's dining request.

Follow these rules strictly:
- Select exactly 5 restaurants from the provided data.
- Choose restaurants that match the user's intent as closely as possible.
- Provide a short description (1-2 sentences) explaining why each place fits the request.
- Infer the cuisine type based on the restaurant name and your knowledge.
- Add a "whyRecommended" field highlighting a unique or special aspect.
- Use ONLY the restaurants provided in the function call data. Do NOT invent or add restaurants.
- Return ONLY valid JSON, with no explanations, markdown, or extra text.`;

    const userPrompt = `Destination: ${destination}

User dining request:
"${query}"

Analyze the restaurant data retrieved from Google Maps and select the top 5 that best match this request.

Return a JSON object with the following exact structure:

{
  "query": "<short interpretation of what the user wants>",
  "restaurants": [
    {
      "name": "string",
      "description": "string (why this place fits the request)",
      "cuisine": "string (inferred cuisine type)",
      "address": "string (the formatted address)",
      "location": { "latitude": number, "longitude": number },
      "whyRecommended": "string (unique or special aspect)"
    }
  ]
}`;

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "getRestaurants",
                description: "Search for restaurants using Google Maps Places API based on a query and destination",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The user's dining query or preferences"
                        },
                        destination: {
                            type: "string",
                            description: "The destination city or location"
                        }
                    },
                    required: ["query", "destination"]
                }
            }
        }
    ];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    let response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        tools,
        tool_choice: "auto"
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0]) {
        throw new Error("No response from OpenAI");
    }

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
            if (toolCall.type === "function" && toolCall.function.name === "getRestaurants") {
                const args = JSON.parse(toolCall.function.arguments);
                const restaurantData = await getRestaurants(args.query, args.destination);

                const formattedData = restaurantData.map(place => ({
                    name: place.displayName.text,
                    formattedAddress: place.formattedAddress,
                    location: {
                        latitude: place.location.latitude,
                        longitude: place.location.longitude
                    }
                }));

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(formattedData)
                });
            }
        }

        response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            response_format: { type: "json_object" }
        });
    }

    if (!response.choices || response.choices.length === 0 || !response.choices[0]) {
        throw new Error("No response from OpenAI");
    }

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as DiningSuggestionsResponse;
}