import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { TripRequestSchema } from "./schema.js";
import { generateItinerary } from "./services/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Protects your free quota once the app is public
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10 });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/itinerary", limiter, async (req, res) => {
  const parsed = TripRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  try {
    const itinerary = await generateItinerary(parsed.data);
    res.json(itinerary);
  } catch (err) {
    console.error(err);
    if (err.status === 429) {
      return res.status(429).json({ error: "The AI service is busy right now. Please try again in a minute." });
    }
        res.status(502).json({
      error: "Failed to generate itinerary. Please try again.",
      debug: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));