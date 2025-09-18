import React, { useState } from "react";
import axios from "axios"; // Axios for HTTP requests

function App() {
  const [message, setMessage] = useState("");

  // Fetch data from the backend (Express)
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000");
      setMessage(response.data); // Set the response message
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <h1>React and Express App</h1>
      <button onClick={fetchData}>Fetch Data from Express</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
