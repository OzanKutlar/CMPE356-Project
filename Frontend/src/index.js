import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Ensure App.js exists in src folder
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
console.log("Running from index.js");

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
