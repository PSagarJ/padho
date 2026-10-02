import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [status, setStatus] = useState("Checking the server...");

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => setStatus(`Server: ${data.status}, database: ${data.db}`))
      .catch(() => setStatus("Could not reach the server."));
  }, []);

  return (
    <main style={{ padding: 24, fontSize: 20 }}>
      <h1>Padho</h1>
      <p>{status}</p>
    </main>
  );
}
