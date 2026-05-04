import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Could not connect to backend"));
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>React Frontend Connected</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;