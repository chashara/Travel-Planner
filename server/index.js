import "dotenv/config";
import express from "express";
import cors from "cors";
import { TripRequestSchema } from "./schema.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Placeholder: Day 2 replaces this with the real LLM call
app.post("/api/itinerary", (req, res) => {
  const parsed = TripRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  res.json({ message: "Received", request: parsed.data });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));