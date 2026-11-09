import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { randomUUID } from "crypto";
import { GeneratedItinerarySchema, CATEGORIES } from "../schema.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const { $schema, ...jsonSchema } = z.toJSONSchema(GeneratedItinerarySchema);

const SYSTEM_PROMPT = `You are an expert travel planner. Create a realistic, well-paced day-by-day itinerary.

Rules:
- Stay within the traveler's total budget (all costs combined, for the whole group).
- estimatedCost is a number in the trip's currency, for the whole group. Use 0 for free activities.
- Order activities chronologically with sensible times (24h "HH:MM"), including meals and travel time.
- Group nearby places on the same day. Don't overpack days.
- Category must be one of: ${CATEGORIES.join(", ")}.
- Use real places and realistic prices for the destination.
- Hotel check-in should not be before 15:00 unless the traveler asks otherwise. Put the full lodging cost for all nights on the check-in activity and say how many nights it covers.
- Use the travel style to decide how much of the budget to spend: budget = well under, balanced = moderate, comfort and luxury = use most of the budget on better hotels, restaurants and experiences.
- Tag an activity with the category of its main purpose, not a side detail.
- Respond with JSON only, matching the provided schema.`;

function buildUserPrompt(r) {
  return [
    `Plan a ${r.days}-day trip to ${r.city}, ${r.country}.`,
    `Total budget: ${r.budget} ${r.currency}.`,
    `Group size: ${r.groupSize}.`,
    r.travelStyle && `Travel style: ${r.travelStyle}.`,
    r.interests?.length && `Interests: ${r.interests.join(", ")}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callModel(request) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserPrompt(request),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema,
    },
  });

  return GeneratedItinerarySchema.parse(JSON.parse(response.text));
}

function addIds(generated) {
  return {
    ...generated,
    days: generated.days.map((day) => ({
      ...day,
      id: `day-${day.dayNumber}`,
      activities: day.activities.map((a) => ({ ...a, id: randomUUID() })),
    })),
  };
}

// Try once, retry once on failure (skip the retry if we hit a quota limit)
export async function generateItinerary(request) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return addIds(await callModel(request));
    } catch (err) {
      lastError = err;
      console.error(`Generation attempt ${attempt} failed:`, err.message);
      if (err.status === 429) break;
    }
  }
  throw lastError;
}