import { useState, useEffect, useRef } from "react";
import TripForm from "./components/TripForm";
import ItineraryView from "./components/ItineraryView";
import { generateItinerary } from "./api";
import { loadItinerary, saveItinerary, clearItinerary, downloadItinerary, readItineraryFile } from "./storage";
import { printItinerary } from "./pdf";
import "./App.css";

export default function App() {
  const [itinerary, setItinerary] = useState(loadItinerary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  // Autosave on every change
  useEffect(() => {
    if (itinerary) saveItinerary(itinerary);
    else clearItinerary();
  }, [itinerary]);

  const handleGenerate = async (request) => {
    if (itinerary && !window.confirm("Generate a new itinerary? Your current one and any edits will be replaced.")) {
      return;
    }
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

  const handleReset = () => {
    if (window.confirm("Start over? This clears your current itinerary and edits.")) {
      setItinerary(null);
      setError("");
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (itinerary && !window.confirm("Import this file? Your current itinerary will be replaced.")) return;

    try {
      setItinerary(await readItineraryFile(file));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Travel Planner</h1>
        <p>Plan it. Tweak it. Take it with you.</p>
      </header>

      <TripForm onSubmit={handleGenerate} loading={loading} />

      <div className="toolbar">
        <button className="btn-soft" onClick={() => fileInput.current?.click()}>
          Import trip (.json)
        </button>
        {itinerary && (
          <>
            <button className="btn-soft" onClick={() => downloadItinerary(itinerary)}>
              Download trip (.json)
            </button>
            <button className="btn-solid" onClick={() => printItinerary(itinerary)}>
              Download PDF
            </button>
          </>
        )}
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImportFile} />
      </div>
      {itinerary && <p className="hint">Your trip is saved automatically in this browser.</p>}

      {loading && <p className="status">Building your itinerary. This can take up to 30 seconds...</p>}
      {error && <p className="status error-banner">{error}</p>}

      {itinerary && !loading && <ItineraryView itinerary={itinerary} onChange={setItinerary} onReset={handleReset} />}
    </div>
  );
}