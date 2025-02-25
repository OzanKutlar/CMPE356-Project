import React, { useState } from "react";
import Email from "./components/EmailPopup/Email";
import Header from "./components/Header/Header";
import Slider from "./components/SlideShow/Slider";
import ItemPicker from "./components/ItemPicker/ItemPicker";
import Util from './Util';
import "./App.css"; // Import styles

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <div>
            <Header />
            <Slider />
            <ItemPicker />
            <button onClick={() => navigateTo("admin")}>Go to Admin Panel</button>
          </div>
        );
      case "admin":
        return (
          <div className="second-page">
            <h1>Admin Page</h1>
            <button onClick={() => navigateTo("home")}>Back to Home</button>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}