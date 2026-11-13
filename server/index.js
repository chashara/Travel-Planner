import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { TripRequestSchema } from "./schema.js";
import { generateItinerary } from "./services/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Hosts like Render sit behind a proxy. This lets the rate limiter see the real visitor IP.
app.set("trust proxy", 1);

const allowedOrigin = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "20kb" }));

// Protects your free AI quota
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

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
    if (err.status === 503) {
      return res.status(503).json({ error: "The AI service is overloaded right now. Please try again in a minute." });
    }
    res.status(502).json({ error: "Failed to generate itinerary. Please try again." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));