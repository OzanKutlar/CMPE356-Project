import React from "react";
import Email from "./components/EmailPopup/Email";
import Header from "./components/Header/Header";
import Slider from "./components/SlideShow/Slider";
import Util from './Util'
import "./App.css"; // Import styles

export default function App() {
  return (
    <div>
      <Header />
      <Slider />
    </div>
  );
}
