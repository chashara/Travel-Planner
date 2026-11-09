const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function generateItinerary(request) {
  const res = await fetch(`${API_URL}/api/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}