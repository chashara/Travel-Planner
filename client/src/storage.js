const STORAGE_KEY = "travel-planner:itinerary:v1";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const str = (v, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Accepts raw or { version, itinerary } data and returns a clean itinerary, or throws
export function normalizeItinerary(raw) {
  const data = raw?.itinerary ?? raw;
  if (!isObject(data) || !isObject(data.trip) || !Array.isArray(data.days)) {
    throw new Error("This file doesn't look like a Travel Planner itinerary.");
  }

  const days = data.days.filter(isObject).map((d, i) => ({
    id: str(d.id) || `day-${i + 1}`,
    dayNumber: num(d.dayNumber, i + 1),
    title: str(d.title, `Day ${i + 1}`),
    activities: (Array.isArray(d.activities) ? d.activities : []).filter(isObject).map((a) => ({
      id: str(a.id) || crypto.randomUUID(),
      time: str(a.time, "12:00"),
      title: str(a.title, "Untitled"),
      description: str(a.description),
      category: str(a.category, "other"),
      estimatedCost: Math.max(0, num(a.estimatedCost)),
    })),
  }));

  return {
    trip: {
      country: str(data.trip.country),
      city: str(data.trip.city),
      days: num(data.trip.days, days.length),
      budget: Math.max(0, num(data.trip.budget)),
      currency: str(data.trip.currency, "EUR"),
      summary: str(data.trip.summary),
    },
    days,
  };
}

// Activities that were just added but never saved (still empty drafts) aren't persisted
function withoutDrafts(itinerary) {
  return {
    ...itinerary,
    days: itinerary.days.map((d) => ({
      ...d,
      activities: d.activities.filter((a) => !a._new),
    })),
  };
}

/* ---------- Autosave in the browser ---------- */

export function loadItinerary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeItinerary(JSON.parse(raw)) : null;
  } catch {
    return null; // nothing saved, corrupted, or storage blocked
  }
}

export function saveItinerary(itinerary) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutDrafts(itinerary)));
  } catch {
    // storage full or blocked: ignore, the app still works
  }
}

export function clearItinerary() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* ---------- Download / import a file ---------- */

function fileName(itinerary) {
  const slug = `${itinerary.trip.city}-${itinerary.trip.country}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "itinerary"}.json`;
}

export function downloadItinerary(itinerary) {
  const payload = { version: 1, itinerary: withoutDrafts(itinerary) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(itinerary);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readItineraryFile(file) {
  if (file.size > MAX_FILE_SIZE) throw new Error("That file is too large.");

  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  return normalizeItinerary(parsed);
}