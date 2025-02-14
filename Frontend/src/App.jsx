import React from "react";
import MeatStore from "./MeatStore"; // Importing the navigation component
import NewsletterPopup from "./components/NewsletterPopup"; // Import the NewsletterPopup component

export default function App() {
  return (
    <div>
      {/* Render the Newsletter Popup */}
      <NewsletterPopup />
      
      {/* Render the MeatStore component (your existing content) */}
      <MeatStore />
    </div>
  );
}
