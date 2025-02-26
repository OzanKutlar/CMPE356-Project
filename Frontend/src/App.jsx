import React, { useState, useEffect } from "react";
import Email from "./components/EmailPopup/Email";
import Header from "./components/Header/Header";
import Slider from "./components/SlideShow/Slider";
import ItemPicker from "./components/ItemPicker/ItemPicker";
import Util from './Util';
import "./App.css"; // Import styles

export default function App() {
  const [currentPage, setCurrentPage] = useState(Util.currentPage);
  
  useEffect(() => {
    // Register listener for page changes
    const removeListener = Util.addPageChangeListener((newPage) => {
      setCurrentPage(newPage);
    });
    
    // Clean up listener when component unmounts
    return removeListener;
  }, []);
  
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <div>
            <Header />
            <Slider />
            <ItemPicker />
            <button onClick={() => Util.navigateTo("admin")}>Go to Admin Panel</button>
          </div>
        );
      case "admin":
        return (
          <div className="second-page">
            <h1>Admin Page</h1>
            <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
          </div>
        );
      default:
        return (
          <div>
          <h1>Page {currentPage} not found</h1>
          <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
          </div>

          );
    }
  };
  
  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}