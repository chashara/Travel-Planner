import ItineraryView from "./components/ItineraryView";
import { useState } from "react";
import TripForm from "./components/TripForm";
import { generateItinerary } from "./api";
import "./App.css";

export default function App() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (request) => {
    setLoading(true);
    setError("");
    try {
      const result = await generateItinerary(request);
      setItinerary(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Travel Planner</h1>
      <TripForm onSubmit={handleGenerate} loading={loading} />

      {loading && <p className="status">Building your itinerary. This can take up to 30 seconds...</p>}
      {error && <p className="status error-banner">{error}</p>}

      {itinerary && !loading && <ItineraryView itinerary={itinerary} />}
    </div>
  );
}