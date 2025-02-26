/* eslint-disable */
import React, { useState, useEffect } from "react";
import Email from "./components/HomePage/EmailPopup/Email";
import Header from "./components/HomePage/Header/Header";
import Slider from "./components/HomePage/SlideShow/Slider";
import ItemPicker from "./components/HomePage/ItemPicker/ItemPicker";
import Recipelist from "./components/RecipePage/Recipelist/Recipelist";
import Util from './Util';
import "./App.css"; // Import styles

export default function App() {
  const [currentPage, setCurrentPage] = useState(Util.currentPage);
  
  

  useEffect(() => {
    // Register listener for page changes
    const removeListener = Util.addPageChangeListener((newPage) => {
      setCurrentPage(newPage);
      window.history.pushState({}, '', newPage);
    });
    
    // Clean up listener when component unmounts
    return removeListener;
  }, []);

   useEffect(() => {
    const path = window.location.pathname; 
    const value = path.split('/')[1]; 
    if (value) {
      Util.navigateTo(value)
    }
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
      case "recipe":
          return (
              <div className="second-page">
                  <Recipelist />
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