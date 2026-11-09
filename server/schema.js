import { z } from "zod";

export const CATEGORIES = ["food", "sightseeing", "transport", "lodging", "activity", "other"];

export const ActivitySchema = z.object({
  id: z.string(),
  time: z.string(), // "09:00"
  title: z.string(),
  description: z.string(),
  category: z.enum(CATEGORIES),
  estimatedCost: z.number().min(0),
});

export const DaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  title: z.string(),
  activities: z.array(ActivitySchema),
});

export const ItinerarySchema = z.object({
  trip: z.object({
    country: z.string(),
    city: z.string(),
    days: z.number().int().positive(),
    budget: z.number().min(0),
    currency: z.string(),
    summary: z.string(),
  }),
  days: z.array(DaySchema),
});

// What the client sends us
export const TripRequestSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  days: z.number().int().min(1).max(14),
  budget: z.number().min(0),
  currency: z.string().default("EUR"),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  groupSize: z.number().int().min(1).default(1),
});

// What the AI returns (no IDs, we add those)
export const GeneratedItinerarySchema = z.object({
  trip: ItinerarySchema.shape.trip,
  days: z.array(
    z.object({
      dayNumber: z.number().int().positive(),
      title: z.string(),
      activities: z.array(ActivitySchema.omit({ id: true })),
    })
  ),
});