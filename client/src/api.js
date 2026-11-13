const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Free hosts put idle servers to sleep. Pinging on page load wakes it before the user submits.
export function wakeServer() {
  fetch(`${API_URL}/api/health`).catch(() => {});
}

export async function generateItinerary(request) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("Couldn't reach the server. It may be waking up, so please try again in a moment.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}