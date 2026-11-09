import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("server unreachable"));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Travel Planner</h1>
      <p>Server status: {status}</p>
    </div>
  );
}